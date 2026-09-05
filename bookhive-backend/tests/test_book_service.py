from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from orm_models.book import BookStatus
from schemas.book import BookCreateRequest, BookUpdateRequest
from services.book_service import (
    BookPermissionError,
    BookService,
    BookValidationError,
)


def make_book(
    *,
    author_id: int = 7,
    status: BookStatus = BookStatus.DRAFT,
    complete: bool = True,
):
    return SimpleNamespace(
        id=3,
        author_id=author_id,
        category_id=1,
        title="Test Book",
        description=(
            "A complete description"
            if complete
            else None
        ),
        language=(
            "English"
            if complete
            else None
        ),
        reading_level="Beginner",
        pdf_path=(
            "storage/books/test.pdf"
            if complete
            else None
        ),
        cover_image_path=(
            "storage/covers/test.jpg"
            if complete
            else None
        ),
        status=status,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        submitted_at=None,
        published_at=None,
    )


@pytest.mark.asyncio
async def test_create_draft_reloads_response_relationships():
    service = BookService()
    session = AsyncMock()
    created_book = make_book()
    hydrated_book = make_book()
    hydrated_book.category_name = "Technology"

    service._validate_category = AsyncMock()
    service.book_repository.create_book = AsyncMock(
        return_value=created_book,
    )
    service.book_repository.get_author_book_by_id = AsyncMock(
        return_value=hydrated_book,
    )

    result = await service.create_draft(
        session=session,
        author_id=7,
        book_data=BookCreateRequest(
            category_id=1,
            title="Test Book",
            description="A complete description",
            language="English",
            reading_level="Beginner",
        ),
    )

    assert result is hydrated_book
    session.commit.assert_awaited_once()
    service.book_repository.get_author_book_by_id.assert_awaited_once_with(
        session=session,
        author_id=7,
        book_id=created_book.id,
    )


@pytest.mark.asyncio
async def test_author_cannot_access_another_authors_book():
    service = BookService()

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=make_book(author_id=99)
    )

    with pytest.raises(BookPermissionError):
        await service.get_book_status(
            AsyncMock(),
            author_id=7,
            book_id=3,
        )


@pytest.mark.asyncio
async def test_incomplete_book_cannot_be_submitted():
    service = BookService()

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=make_book(complete=False)
    )

    with pytest.raises(
        BookValidationError,
        match="Missing",
    ):
        await service.submit_book(
            AsyncMock(),
            author_id=7,
            book_id=3,
        )


@pytest.mark.asyncio
async def test_rejected_book_can_be_corrected_and_resubmitted():
    service = BookService()
    rejected_book = make_book(
        status=BookStatus.REJECTED,
    )
    session = AsyncMock()

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=rejected_book
    )
    service.book_repository.update_book_status = AsyncMock(
        return_value=rejected_book
    )

    result = await service.submit_book(
        session,
        author_id=7,
        book_id=3,
    )

    assert result is rejected_book

    service.book_repository.update_book_status.assert_awaited_once()

    assert (
        service.book_repository
        .update_book_status
        .await_args
        .kwargs["new_status"]
        == BookStatus.PENDING_REVIEW
    )

    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_pending_book_cannot_be_edited():
    service = BookService()

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=make_book(
            status=BookStatus.PENDING_REVIEW
        )
    )

    with pytest.raises(
        BookValidationError,
        match="DRAFT or REJECTED",
    ):
        await service.update_book(
            AsyncMock(),
            author_id=7,
            book_id=3,
            book_data=BookUpdateRequest(
                title="Updated title"
            ),
        )


@pytest.mark.asyncio
async def test_pdf_upload_updates_owned_draft_book(
    monkeypatch,
):
    service = BookService()
    book = make_book()
    book.pdf_path = "storage/books/old.pdf"

    session = AsyncMock()
    upload = object()

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=book,
    )
    service.book_repository.update_book = AsyncMock(
        return_value=book,
    )
    service.book_repository.get_author_book_by_id = AsyncMock(
        return_value=book,
    )

    save_pdf_mock = AsyncMock(
        return_value="storage/books/new.pdf",
    )
    delete_file_mock = AsyncMock()

    monkeypatch.setattr(
        "services.book_service.save_pdf",
        save_pdf_mock,
    )
    monkeypatch.setattr(
        "services.book_service.delete_stored_file",
        delete_file_mock,
    )

    result = await service.upload_pdf(
        session=session,
        author_id=7,
        book_id=3,
        upload=upload,
    )

    assert result is book

    save_pdf_mock.assert_awaited_once_with(upload)

    service.book_repository.update_book.assert_awaited_once_with(
        session,
        book,
        {
            "pdf_path": "storage/books/new.pdf",
        },
    )

    session.commit.assert_awaited_once()
    service.book_repository.get_author_book_by_id.assert_awaited_once_with(
        session=session,
        author_id=book.author_id,
        book_id=book.id,
    )

    delete_file_mock.assert_awaited_once_with(
        "storage/books/old.pdf"
    )


@pytest.mark.asyncio
async def test_pending_book_cannot_receive_pdf_upload(
    monkeypatch,
):
    service = BookService()

    book = make_book(
        status=BookStatus.PENDING_REVIEW,
    )

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=book,
    )

    save_pdf_mock = AsyncMock()

    monkeypatch.setattr(
        "services.book_service.save_pdf",
        save_pdf_mock,
    )

    with pytest.raises(
        BookValidationError,
        match="DRAFT or REJECTED",
    ):
        await service.upload_pdf(
            session=AsyncMock(),
            author_id=7,
            book_id=3,
            upload=object(),
        )

    save_pdf_mock.assert_not_awaited()


@pytest.mark.asyncio
async def test_author_cannot_upload_to_another_authors_book(
    monkeypatch,
):
    service = BookService()

    book = make_book(
        author_id=99,
    )

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=book,
    )

    save_pdf_mock = AsyncMock()

    monkeypatch.setattr(
        "services.book_service.save_pdf",
        save_pdf_mock,
    )

    with pytest.raises(BookPermissionError):
        await service.upload_pdf(
            session=AsyncMock(),
            author_id=7,
            book_id=3,
            upload=object(),
        )

    save_pdf_mock.assert_not_awaited()


@pytest.mark.asyncio
async def test_new_upload_is_deleted_when_database_update_fails(
    monkeypatch,
):
    service = BookService()
    book = make_book()
    session = AsyncMock()

    service.book_repository.get_book_by_id = AsyncMock(
        return_value=book,
    )
    service.book_repository.update_book = AsyncMock(
        side_effect=RuntimeError(
            "Database update failed"
        ),
    )

    save_pdf_mock = AsyncMock(
        return_value="storage/books/new.pdf",
    )
    delete_file_mock = AsyncMock()

    monkeypatch.setattr(
        "services.book_service.save_pdf",
        save_pdf_mock,
    )
    monkeypatch.setattr(
        "services.book_service.delete_stored_file",
        delete_file_mock,
    )

    with pytest.raises(
        RuntimeError,
        match="Database update failed",
    ):
        await service.upload_pdf(
            session=session,
            author_id=7,
            book_id=3,
            upload=object(),
        )

    session.rollback.assert_awaited_once()

    delete_file_mock.assert_awaited_once_with(
        "storage/books/new.pdf"
    )

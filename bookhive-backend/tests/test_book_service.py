from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from orm_models.book import BookStatus
from schemas.book import BookUpdateRequest
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
        description="A complete description" if complete else None,
        language="English" if complete else None,
        reading_level="Beginner",
        pdf_path="storage/books/test.pdf" if complete else None,
        cover_image_path="storage/covers/test.jpg" if complete else None,
        status=status,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        submitted_at=None,
        published_at=None,
    )


@pytest.mark.asyncio
async def test_author_cannot_access_another_authors_book():
    service = BookService()
    service.book_repository.get_book_by_id = AsyncMock(
        return_value=make_book(author_id=99)
    )

    with pytest.raises(BookPermissionError):
        await service.get_book_status(AsyncMock(), author_id=7, book_id=3)


@pytest.mark.asyncio
async def test_incomplete_book_cannot_be_submitted():
    service = BookService()
    service.book_repository.get_book_by_id = AsyncMock(
        return_value=make_book(complete=False)
    )

    with pytest.raises(BookValidationError, match="Missing"):
        await service.submit_book(AsyncMock(), author_id=7, book_id=3)


@pytest.mark.asyncio
async def test_rejected_book_can_be_corrected_and_resubmitted():
    service = BookService()
    rejected_book = make_book(status=BookStatus.REJECTED)
    session = AsyncMock()
    service.book_repository.get_book_by_id = AsyncMock(return_value=rejected_book)
    service.book_repository.update_book_status = AsyncMock(
        return_value=rejected_book
    )

    result = await service.submit_book(session, author_id=7, book_id=3)

    assert result is rejected_book
    service.book_repository.update_book_status.assert_awaited_once()
    assert (
        service.book_repository.update_book_status.await_args.kwargs["new_status"]
        == BookStatus.PENDING_REVIEW
    )
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_pending_book_cannot_be_edited():
    service = BookService()
    service.book_repository.get_book_by_id = AsyncMock(
        return_value=make_book(status=BookStatus.PENDING_REVIEW)
    )

    with pytest.raises(BookValidationError, match="DRAFT or REJECTED"):
        await service.update_book(
            AsyncMock(),
            author_id=7,
            book_id=3,
            book_data=BookUpdateRequest(title="Updated title"),
        )

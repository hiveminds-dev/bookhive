"""Handles Book rules."""

import logging
from datetime import UTC, datetime

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book, BookStatus
from repositories.book_repository import BookRepository
from schemas.book import BookCreateRequest, BookUpdateRequest
from utils.file_handler import (
    FileUploadError,
    delete_stored_file,
    save_cover,
    save_pdf,
)

logger = logging.getLogger(__name__)


class BookNotFoundError(ValueError):
    pass


class BookPermissionError(ValueError):
    pass


class BookValidationError(ValueError):
    pass


class BookService:
    def __init__(self) -> None:
        self.book_repository = BookRepository()

    async def create_draft(
        self,
        session: AsyncSession,
        author_id: int,
        book_data: BookCreateRequest,
    ) -> Book:
        await self._validate_category(session, book_data.category_id)

        try:
            book = await self.book_repository.create_book(
                session=session,
                author_id=author_id,
                book_data=book_data.model_dump(),
            )
            await session.commit()
            await session.refresh(book)
            return book
        except Exception:
            await session.rollback()
            raise

    async def list_author_books(
        self,
        session: AsyncSession,
        author_id: int,
        book_status: BookStatus | None,
        offset: int,
        limit: int,
    ) -> list[Book]:
        return await self.book_repository.get_author_books(
            session,
            author_id,
            book_status,
            offset,
            limit,
        )

    async def update_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
        book_data: BookUpdateRequest,
    ) -> Book:
        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        updates = book_data.model_dump(exclude_unset=True)
        category_id = updates.get("category_id")

        if category_id is not None:
            await self._validate_category(
                session,
                category_id,
            )

        try:
            updated_book = await self.book_repository.update_book(
                session,
                book,
                updates,
            )
            await session.commit()
            await session.refresh(updated_book)
            return updated_book

        except Exception:
            await session.rollback()
            raise

    async def upload_pdf(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
        upload: UploadFile,
    ) -> Book:
        """Validate and attach a PDF to an author's book."""

        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        new_pdf_path = await save_pdf(upload)
        old_pdf_path = book.pdf_path

        return await self._save_uploaded_path(
            session=session,
            book=book,
            field_name="pdf_path",
            new_path=new_pdf_path,
            old_path=old_pdf_path,
        )

    async def upload_cover(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
        upload: UploadFile,
    ) -> Book:
        """Validate and attach a cover image to an author's book."""

        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        new_cover_path = await save_cover(upload)
        old_cover_path = book.cover_image_path

        return await self._save_uploaded_path(
            session=session,
            book=book,
            field_name="cover_image_path",
            new_path=new_cover_path,
            old_path=old_cover_path,
        )

    async def submit_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        missing_fields = [
            field
            for field, value in {
                "title": book.title,
                "description": book.description,
                "language": book.language,
                "pdf_path": book.pdf_path,
                "cover_image_path": book.cover_image_path,
            }.items()
            if value is None
            or (
                isinstance(value, str)
                and not value.strip()
            )
        ]

        if missing_fields:
            raise BookValidationError(
                "Book submission is incomplete. Missing: "
                + ", ".join(missing_fields)
            )

        try:
            updated_book = (
                await self.book_repository.update_book_status(
                    session=session,
                    book=book,
                    new_status=BookStatus.PENDING_REVIEW,
                    submitted_at=datetime.now(UTC),
                )
            )
            await session.commit()
            await session.refresh(updated_book)
            return updated_book

        except Exception:
            await session.rollback()
            raise

    async def get_book_status(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        return await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

    async def _save_uploaded_path(
        self,
        *,
        session: AsyncSession,
        book: Book,
        field_name: str,
        new_path: str,
        old_path: str | None,
    ) -> Book:
        """Save an uploaded path and clean up replaced files."""

        try:
            updated_book = await self.book_repository.update_book(
                session,
                book,
                {field_name: new_path},
            )

            await session.commit()
            await session.refresh(updated_book)

        except Exception:
            await session.rollback()
            await self._delete_upload_quietly(new_path)
            raise

        if old_path and old_path != new_path:
            await self._delete_upload_quietly(old_path)

        return updated_book

    async def _delete_upload_quietly(
        self,
        path: str | None,
    ) -> None:
        """Delete an upload without failing a completed database update."""

        try:
            await delete_stored_file(path)

        except (FileUploadError, OSError) as exc:
            logger.warning(
                "Could not delete uploaded file %s: %s",
                path,
                exc,
            )

    async def _get_owned_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        book = await self.book_repository.get_book_by_id(
            session,
            book_id,
        )

        if book is None:
            raise BookNotFoundError("Book not found")

        if book.author_id != author_id:
            raise BookPermissionError(
                "You do not have permission to access this book"
            )

        return book

    async def _validate_category(
        self,
        session: AsyncSession,
        category_id: int,
    ) -> None:
        category = await self.book_repository.get_active_category(
            session,
            category_id,
        )

        if category is None:
            raise BookValidationError(
                "Category does not exist or is inactive"
            )

    @staticmethod
    def _ensure_book_is_editable(book: Book) -> None:
        if book.status not in {
            BookStatus.DRAFT,
            BookStatus.REJECTED,
        }:
            raise BookValidationError(
                "Only DRAFT or REJECTED books can be edited"
            )
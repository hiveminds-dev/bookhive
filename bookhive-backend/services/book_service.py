"""Handles Book rules."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book, BookStatus
from repositories.book_repository import BookRepository
from schemas.book import BookCreateRequest, BookUpdateRequest


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
        book = await self._get_owned_book(session, author_id, book_id)
        if book.status not in {BookStatus.DRAFT, BookStatus.REJECTED}:
            raise BookValidationError(
                "Only DRAFT or REJECTED books can be edited"
            )

        updates = book_data.model_dump(exclude_unset=True)
        category_id = updates.get("category_id")
        if category_id is not None:
            await self._validate_category(session, category_id)

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

    async def submit_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        book = await self._get_owned_book(session, author_id, book_id)
        if book.status not in {BookStatus.DRAFT, BookStatus.REJECTED}:
            raise BookValidationError(
                "Only DRAFT or REJECTED books can be submitted"
            )

        missing_fields = [
            field
            for field, value in {
                "title": book.title,
                "description": book.description,
                "language": book.language,
                "pdf_path": book.pdf_path,
                "cover_image_path": book.cover_image_path,
            }.items()
            if value is None or (isinstance(value, str) and not value.strip())
        ]
        if missing_fields:
            raise BookValidationError(
                "Book submission is incomplete. Missing: "
                + ", ".join(missing_fields)
            )

        try:
            updated_book = await self.book_repository.update_book_status(
                session=session,
                book=book,
                new_status=BookStatus.PENDING_REVIEW,
                submitted_at=datetime.now(timezone.utc),
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
        return await self._get_owned_book(session, author_id, book_id)

    async def _get_owned_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        book = await self.book_repository.get_book_by_id(session, book_id)
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
            raise BookValidationError("Category does not exist or is inactive")

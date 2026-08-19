"""Handles Book rules."""
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from orm_models import BookStatus
from repositories.book_repository import BookRepository
from schemas.book import BookCreateRequest, BookResponse, BookStatusResponse


class BookService:
    def __init__(self):
        self.book_repository = BookRepository()

    async def create_draft(self, session: AsyncSession, author_id: int, book_data: BookCreateRequest) -> BookResponse:

        data_dict = book_data.model_dump()

        book = await self.book_repository.create_book(
            session=session,
            author_id=author_id,
            book_data=data_dict
        )

        await session.commit()
        await session.refresh(book)

        return BookResponse(
            id=book.id,
            author_id=book.author_id,
            category_id=book.category_id,
            title=book.title,
            status=book.status.value,
            created_at=book.created_at
        )

    async def submit_book(self, session: AsyncSession, author_id: int, book_id: int) -> BookStatusResponse:

        book = await self.book_repository.get_book_by_id(session, book_id)

        if not book:
            raise ValueError("Book not found")

        if book.author_id != author_id:
            raise ValueError("You do not have permission to submit this book")

        if book.status != BookStatus.DRAFT:
            raise ValueError(f"Only DRAFT books can be submitted. Current status is {book.status.value}")

        submitted_time = datetime.now(timezone.utc)

        updated_book = await self.book_repository.update_book_status(
            session=session,
            book=book,
            new_status=BookStatus.PENDING_REVIEW,
            submitted_at=submitted_time
        )

        await session.commit()
        await session.refresh(updated_book)

        return BookStatusResponse(
            id=updated_book.id,
            title=updated_book.title,
            status=updated_book.status.value,
            submitted_at=updated_book.submitted_at,
            published_at=updated_book.published_at
        )

    async def get_book_status(self, session: AsyncSession, author_id: int, book_id: int) -> BookStatusResponse:

        book = await self.book_repository.get_book_by_id(session, book_id)

        if not book:
            raise ValueError("Book not found")

        if book.author_id != author_id:
            raise ValueError("You do not have permission to view this book's status")

        return BookStatusResponse(
            id=book.id,
            title=book.title,
            status=book.status,
            submitted_at=book.submitted_at,
            published_at=book.published_at
        )

"""Handles Book database work."""
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models import Book, BookStatus


class BookRepository:
    async def create_book(self, session: AsyncSession, author_id: int, book_data: dict) -> Book:
        new_book = Book(
            author_id=author_id,
            category_id=book_data["category_id"],
            title=book_data["title"],
            description=book_data.get("description"),
            language=book_data.get("language"),
            reading_level=book_data.get("reading_level"),
            status=BookStatus.DRAFT
        )
        session.add(new_book)
        await session.flush()
        return new_book

    async def get_book_by_id(self, session: AsyncSession, book_id: int) -> Book | None:
        query = select(Book).where(Book.id == book_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def update_book_status(self, session: AsyncSession, book: Book, new_status: BookStatus, submitted_at: datetime | None = None) -> Book:
        book.status = new_status
        if submitted_at:
            book.submitted_at = submitted_at

        await session.flush()
        return book
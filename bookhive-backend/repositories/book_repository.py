"""Handles Book database work."""

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book, BookStatus
from orm_models.category import Category


class BookRepository:
    async def create_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_data: dict,
    ) -> Book:
        book = Book(
            author_id=author_id,
            category_id=book_data["category_id"],
            title=book_data["title"],
            description=book_data.get("description"),
            language=book_data.get("language"),
            reading_level=book_data.get("reading_level"),
            pdf_path=book_data.get("pdf_path"),
            cover_image_path=book_data.get("cover_image_path"),
            status=BookStatus.DRAFT,
        )
        session.add(book)
        await session.flush()
        return book

    async def get_book_by_id(
        self,
        session: AsyncSession,
        book_id: int,
    ) -> Book | None:
        result = await session.execute(select(Book).where(Book.id == book_id))
        return result.scalar_one_or_none()

    async def get_author_books(
        self,
        session: AsyncSession,
        author_id: int,
        book_status: BookStatus | None,
        offset: int,
        limit: int,
    ) -> list[Book]:
        query = select(Book).where(Book.author_id == author_id)
        if book_status is not None:
            query = query.where(Book.status == book_status)

        result = await session.execute(
            query.order_by(Book.updated_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    async def get_active_category(
        self,
        session: AsyncSession,
        category_id: int,
    ) -> Category | None:
        result = await session.execute(
            select(Category).where(
                Category.id == category_id,
                Category.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def update_book(
        self,
        session: AsyncSession,
        book: Book,
        updates: dict,
    ) -> Book:
        for field, value in updates.items():
            setattr(book, field, value)
        await session.flush()
        return book

    async def update_book_status(
        self,
        session: AsyncSession,
        book: Book,
        new_status: BookStatus,
        submitted_at: datetime | None = None,
    ) -> Book:
        book.status = new_status
        book.submitted_at = submitted_at
        await session.flush()
        return book

    async def get_author_status_counts(
        self,
        session: AsyncSession,
        author_id: int,
    ) -> dict[BookStatus, int]:
        result = await session.execute(
            select(Book.status, func.count(Book.id))
            .where(Book.author_id == author_id)
            .group_by(Book.status)
        )
        return {book_status: count for book_status, count in result.all()}

    async def get_recent_author_books(
        self,
        session: AsyncSession,
        author_id: int,
        limit: int = 5,
    ) -> list[Book]:
        result = await session.execute(
            select(Book)
            .where(Book.author_id == author_id)
            .order_by(Book.updated_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

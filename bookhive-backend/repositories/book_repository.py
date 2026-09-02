"""Handles Book database work."""

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from orm_models.book import Book, BookStatus
from orm_models.category import Category
from orm_models.user import User


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
        result = await session.execute(
            select(Book)
            .options(
                selectinload(Book.category),
                selectinload(Book.rejection_logs),
            )
            .where(
                Book.id == book_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_published_book_details(
        self,
        session: AsyncSession,
        book_id: int,
    ) -> Book | None:
        """Return a published book with its author and category."""

        query = (
            select(Book)
            .options(
                selectinload(Book.author).selectinload(
                    User.author_profile
                ),
                selectinload(Book.category),
            )
            .where(
                Book.id == book_id,
                Book.status == BookStatus.PUBLISHED,
            )
        )

        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def get_author_books(
        self,
        session: AsyncSession,
        author_id: int,
        book_status: BookStatus | None,
        offset: int,
        limit: int,
    ) -> list[Book]:
        query = (
            select(Book)
            .options(
                selectinload(Book.category),
                selectinload(Book.rejection_logs),
            )
            .where(
                Book.author_id == author_id
            )
        )

        if book_status is not None:
            query = query.where(
                Book.status == book_status
            )

        result = await session.execute(
            query
            .order_by(Book.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def get_author_book_by_id(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book | None:
        """Return an author's book by ID with category and rejection logs."""
        query = (
            select(Book)
            .options(
                selectinload(Book.category),
                selectinload(Book.rejection_logs),
            )
            .where(
                Book.id == book_id,
                Book.author_id == author_id,
            )
        )
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def delete_book(
        self,
        session: AsyncSession,
        book: Book,
    ) -> None:
        """Delete a book from database."""
        await session.delete(book)
        await session.flush()

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
            select(
                Book.status,
                func.count(Book.id),
            )
            .where(
                Book.author_id == author_id
            )
            .group_by(Book.status)
        )

        return {
            book_status: count
            for book_status, count in result.all()
        }

    async def get_recent_author_books(
        self,
        session: AsyncSession,
        author_id: int,
        limit: int = 5,
    ) -> list[Book]:
        result = await session.execute(
            select(Book)
            .where(
                Book.author_id == author_id
            )
            .order_by(Book.updated_at.desc())
            .limit(limit)
        )

        return list(result.scalars().all())

    async def get_published_books_with_filters(
        self,
        session: AsyncSession,
        *,
        offset: int,
        limit: int,
        search_query: str | None = None,
        category_id: int | None = None,
        language: str | None = None,
    ) -> list[Book]:
        query = (
            select(Book)
            .options(
                joinedload(Book.author).joinedload(User.author_profile),
                joinedload(Book.category),
            )
            .where(Book.status == BookStatus.PUBLISHED)
        )
        query = self._apply_catalogue_filters(
            query,
            search_query=search_query,
            category_id=category_id,
            language=language,
        )
        result = await session.execute(
            query.order_by(
                Book.published_at.desc(), Book.id.desc()
            )
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_published_books_count(
        self,
        session: AsyncSession,
        *,
        search_query: str | None = None,
        category_id: int | None = None,
        language: str | None = None,
    ) -> int:
        query = select(func.count(Book.id)).where(
            Book.status == BookStatus.PUBLISHED
        )
        query = self._apply_catalogue_filters(
            query,
            search_query=search_query,
            category_id=category_id,
            language=language,
        )
        result = await session.execute(query)
        return int(result.scalar_one())

    @staticmethod
    def _apply_catalogue_filters(
        query,
        *,
        search_query: str | None,
        category_id: int | None,
        language: str | None,
    ):
        if search_query:
            query = query.where(
                Book.title.ilike(f"%{search_query.strip()}%")
            )
        if category_id is not None:
            query = query.where(Book.category_id == category_id)
        if language:
            query = query.where(
                func.lower(Book.language) == language.strip().lower()
            )
        return query

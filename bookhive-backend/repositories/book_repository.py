from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book, BookStatus


class BookRepository:

    async def get_author_stats(self, session: AsyncSession, author_id: int) -> dict:

        total_query = select(func.count()).select_from(Book).where(Book.author_id == author_id)
        total_result = await session.execute(total_query)
        total_books = total_result.scalar() or 0

        published_query = select(func.count()).select_from(Book).where(
            Book.author_id == author_id,
            Book.status == BookStatus.PUBLISHED
        )
        published_result = await session.execute(published_query)
        published_books = published_result.scalar() or 0

        pending_query = select(func.count()).select_from(Book).where(
            Book.author_id == author_id,
            Book.status == BookStatus.PENDING_REVIEW
        )
        pending_result = await session.execute(pending_query)
        pending_approval =pending_result.scalar() or 0

        return {
            "total_books": total_books,
            "published_books": published_books,
            "pending_approval": pending_approval
        }

    async def get_recent_uploads(self, session: AsyncSession, author_id: int, limit: int = 3):

        query = (
            select(Book)
            .where(Book.author_id == author_id)
            .order_by(desc(Book.created_at))
            .limit(limit)
        )

        result = await session.execute(query)
        return result.scalars().all()
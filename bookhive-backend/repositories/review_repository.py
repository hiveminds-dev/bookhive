"""Handles Review database work."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from orm_models.review import Review


class ReviewRepository:
    async def get_visible_reviews_for_book(
        self,
        session: AsyncSession,
        book_id: int,
    ) -> list[Review]:
        """Return public reviews for a Book, newest first."""

        query = (
            select(Review)
            .options(selectinload(Review.reader))
            .where(
                Review.book_id == book_id,
                Review.is_visible.is_(True),
            )
            .order_by(Review.created_at.desc())
        )

        result = await session.execute(query)
        return list(result.scalars().all())

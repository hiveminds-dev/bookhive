"""Handles Review database work."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from orm_models.review import Review


class ReviewRepository:
    async def get_reviews_for_book(
        self,
        session: AsyncSession,
        book_id: int,
    ) -> list[Review]:
        """Return reviews for a Book, newest first."""
        query = (
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.book_id == book_id)
            .order_by(Review.created_at.desc())
        )
        result = await session.execute(query)
        return list(result.scalars().all())

    async def get_review_by_id(
        self,
        session: AsyncSession,
        review_id: int,
    ) -> Review | None:
        """Return a review by ID with eager user loading."""
        query = (
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.id == review_id)
        )
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def get_user_review_for_book(
        self,
        session: AsyncSession,
        book_id: int,
        user_id: int,
    ) -> Review | None:
        """Return a user's existing review for a specific book if present."""
        query = (
            select(Review)
            .options(selectinload(Review.user))
            .where(
                Review.book_id == book_id,
                Review.user_id == user_id,
            )
        )
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def create_review(
        self,
        session: AsyncSession,
        *,
        book_id: int,
        user_id: int,
        rating: int,
        comment: str | None = None,
    ) -> Review:
        """Create a new review."""
        review = Review(
            book_id=book_id,
            user_id=user_id,
            rating=rating,
            comment=comment,
        )
        session.add(review)
        await session.flush()
        return review

    async def update_review(
        self,
        session: AsyncSession,
        review: Review,
        *,
        rating: int | None = None,
        comment: str | None = None,
    ) -> Review:
        """Update review fields."""
        if rating is not None:
            review.rating = rating
        if comment is not None:
            review.comment = comment
        await session.flush()
        return review

    async def delete_review(
        self,
        session: AsyncSession,
        review: Review,
    ) -> None:
        """Delete a review from the database."""
        await session.delete(review)
        await session.flush()

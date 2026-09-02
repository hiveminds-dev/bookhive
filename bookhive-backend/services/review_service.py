"""Handles rating and review business rules."""

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import BookStatus
from repositories.book_repository import BookRepository
from repositories.review_repository import ReviewRepository
from schemas.review import (
    PublicReviewResponse,
    ReviewCreateRequest,
    ReviewUpdateRequest,
)

logger = logging.getLogger(__name__)


class ReviewNotFoundError(ValueError):
    pass


class ReviewPermissionError(ValueError):
    pass


class ReviewConflictError(ValueError):
    pass


class ReviewValidationError(ValueError):
    pass


class ReviewService:
    def __init__(self) -> None:
        self.review_repository = ReviewRepository()
        self.book_repository = BookRepository()

    def _to_public_response(self, review) -> PublicReviewResponse:
        reader_name = (
            review.user.username
            if review.user
            else "Anonymous Reader"
        )
        return PublicReviewResponse(
            id=review.id,
            book_id=review.book_id,
            user_id=review.user_id,
            reader_name=reader_name,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            updated_at=review.updated_at,
        )

    async def create_review(
        self,
        session: AsyncSession,
        *,
        book_id: int,
        reader_id: int,
        review_data: ReviewCreateRequest,
    ) -> PublicReviewResponse:
        book = await self.book_repository.get_published_book_details(
            session=session,
            book_id=book_id,
        )
        if book is None or book.status != BookStatus.PUBLISHED:
            raise ReviewNotFoundError("Published book not found")

        existing_review = await self.review_repository.get_user_review_for_book(
            session=session,
            book_id=book_id,
            user_id=reader_id,
        )
        if existing_review is not None:
            raise ReviewConflictError(
                "You have already submitted a review for this book"
            )

        if not (1 <= review_data.rating <= 5):
            raise ReviewValidationError("Rating must be between 1 and 5")

        if review_data.comment and len(review_data.comment) > 2000:
            raise ReviewValidationError("Comment cannot exceed 2000 characters")

        try:
            review = await self.review_repository.create_review(
                session=session,
                book_id=book_id,
                user_id=reader_id,
                rating=review_data.rating,
                comment=review_data.comment.strip() if review_data.comment else None,
            )
            await session.commit()
            hydrated = await self.review_repository.get_review_by_id(
                session=session,
                review_id=review.id,
            )
            if hydrated is None:
                raise ReviewNotFoundError("Created review could not be reloaded")
            return self._to_public_response(hydrated)
        except Exception:
            await session.rollback()
            raise

    async def get_book_reviews(
        self,
        session: AsyncSession,
        book_id: int,
    ) -> list[PublicReviewResponse]:
        book = await self.book_repository.get_published_book_details(
            session=session,
            book_id=book_id,
        )
        if book is None or book.status != BookStatus.PUBLISHED:
            raise ReviewNotFoundError("Published book not found")

        reviews = await self.review_repository.get_reviews_for_book(
            session=session,
            book_id=book_id,
        )
        return [self._to_public_response(r) for r in reviews]

    async def get_my_review_for_book(
        self,
        session: AsyncSession,
        book_id: int,
        reader_id: int,
    ) -> PublicReviewResponse | None:
        review = await self.review_repository.get_user_review_for_book(
            session=session,
            book_id=book_id,
            user_id=reader_id,
        )
        if review is None:
            return None
        return self._to_public_response(review)

    async def update_review(
        self,
        session: AsyncSession,
        *,
        review_id: int,
        reader_id: int,
        update_data: ReviewUpdateRequest,
    ) -> PublicReviewResponse:
        review = await self.review_repository.get_review_by_id(
            session=session,
            review_id=review_id,
        )
        if review is None:
            raise ReviewNotFoundError("Review not found")

        if review.user_id != reader_id:
            raise ReviewPermissionError("You can only edit your own review")

        if update_data.rating is not None and not (1 <= update_data.rating <= 5):
            raise ReviewValidationError("Rating must be between 1 and 5")

        if update_data.comment is not None and len(update_data.comment) > 2000:
            raise ReviewValidationError("Comment cannot exceed 2000 characters")

        comment_val = (
            update_data.comment.strip()
            if update_data.comment is not None
            else review.comment
        )

        try:
            updated = await self.review_repository.update_review(
                session=session,
                review=review,
                rating=update_data.rating if update_data.rating is not None else review.rating,
                comment=comment_val,
            )
            await session.commit()
            hydrated = await self.review_repository.get_review_by_id(
                session=session,
                review_id=updated.id,
            )
            if hydrated is None:
                raise ReviewNotFoundError("Updated review could not be reloaded")
            return self._to_public_response(hydrated)
        except Exception:
            await session.rollback()
            raise

    async def delete_review(
        self,
        session: AsyncSession,
        *,
        review_id: int,
        reader_id: int,
    ) -> None:
        review = await self.review_repository.get_review_by_id(
            session=session,
            review_id=review_id,
        )
        if review is None:
            raise ReviewNotFoundError("Review not found")

        if review.user_id != reader_id:
            raise ReviewPermissionError("You can only delete your own review")

        try:
            await self.review_repository.delete_review(
                session=session,
                review=review,
            )
            await session.commit()
        except Exception:
            await session.rollback()
            raise

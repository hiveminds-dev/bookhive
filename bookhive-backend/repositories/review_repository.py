from datetime import datetime

from pydantic.dataclasses import dataclass

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book
from orm_models.review import BookReview
from orm_models.user import User


@dataclass
class ReviewDTO:
    reviewer_name: str
    rating: int
    review_text: str
    created_at: datetime

class ReviewRepository:
    async def get_recent_reviews_for_author(self, session: AsyncSession, author_id: int, limit: int = 2):

        query = (
            select(BookReview, User.full_name)
            .join(Book, Book.id == BookReview.book_id)
            .join(User, User.id == BookReview.user_id)
            .where(Book.author_id == author_id)
            .order_by(desc(BookReview.created_at))
            .limit(limit)
        )

        result = await session.execute(query)
        rows = result.all()

        recent_reviews = []
        for review_obj, reviewer_name in rows:
            recent_reviews.append(
                ReviewDTO(
                    reviewer_name=reviewer_name,
                    rating=review_obj.rating,
                    review_text=review_obj.review_text,
                    created_at=review_obj.created_at
                )
            )

        return recent_reviews

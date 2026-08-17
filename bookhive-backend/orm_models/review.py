"""Defines the Review database table."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Integer, ForeignKey, Text, CheckConstraint, DateTime, func
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.testing.schema import mapped_column

from database import Base

if TYPE_CHECKING:
    from orm_models.book import Book
    from orm_models.user import User


class BookReview(Base):
    __tablename__ = "book_reviews"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,

    )

    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id"),
        nullable=False,
        index=True,
    )

    review_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    rating: Mapped[int] = mapped_column(
        Integer,
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
        nullable=False,
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=True,
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True,
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="reviews"
    )

    book: Mapped["Book"] = relationship(
        "Book",
        back_populates="reviews"
    )

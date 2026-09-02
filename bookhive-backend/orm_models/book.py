"""Defines the Book database table."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from orm_models.book_rejection_log import BookRejectionLog
    from orm_models.category import Category
    from orm_models.review import Review
    from orm_models.user import User


class BookStatus(enum.StrEnum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    DEACTIVATED = "DEACTIVATED"



class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    language: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    reading_level: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    pdf_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    cover_image_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    page_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=0,
    )

    view_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=0,
    )

    download_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=0,
    )

    @property
    def rejection_reason(self) -> str | None:
        """Returns the latest rejection reason from rejection_logs, if available."""
        if self.rejection_logs:
            return self.rejection_logs[0].reason
        return None

    @property
    def category_name(self) -> str | None:
        """Returns category name if category relationship is loaded."""
        if getattr(self, "category", None) is not None and self.category:
            return self.category.name
        return None

    @property
    def cover_url(self) -> str | None:
        """Returns the public URL for the cover image."""
        if not self.cover_image_path:
            return None
        path = self.cover_image_path.strip().replace("\\", "/").lstrip("/")
        if path.startswith(("http://", "https://")):
            return path
        return f"/{path}"

    @property
    def pdf_url(self) -> str | None:
        """Returns the URL for the PDF file."""
        if not self.pdf_path:
            return None
        path = self.pdf_path.strip().replace("\\", "/").lstrip("/")
        if path.startswith(("http://", "https://")):
            return path
        return f"/{path}"

    @property
    def estimated_reading_time(self) -> str:
        """Returns estimated reading time string based on page count (~2 mins/page)."""
        pages = self.page_count or 0
        if pages <= 0:
            return "N/A"
        total_minutes = pages * 2
        hours = total_minutes // 60
        mins = total_minutes % 60
        if hours > 0 and mins > 0:
            return f"{hours} hours {mins} mins"
        elif hours > 0:
            return f"{hours} hours"
        else:
            return f"{mins} mins"

    @property
    def average_rating(self) -> float:
        """Calculates average rating dynamically from associated reviews."""
        if not self.reviews:
            return 0.0
        total = sum(r.rating for r in self.reviews)
        return round(total / len(self.reviews), 1)

    @property
    def review_count(self) -> int:
        """Returns total review count dynamically."""
        return len(self.reviews) if self.reviews else 0

    status: Mapped[BookStatus] = mapped_column(
        SQLEnum(BookStatus),
        default=BookStatus.DRAFT,
        server_default=BookStatus.DRAFT.value,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    author: Mapped[User] = relationship(
        "User",
        back_populates="books",
    )

    category: Mapped[Category] = relationship(
        "Category",
        back_populates="books",
    )

    reviews: Mapped[list[Review]] = relationship(
        "Review",
        back_populates="book",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    rejection_logs: Mapped[list[BookRejectionLog]] = relationship(
        "BookRejectionLog",
        back_populates="book",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="BookRejectionLog.created_at.desc()",
    )

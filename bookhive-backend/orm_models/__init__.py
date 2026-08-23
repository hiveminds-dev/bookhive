"""Import all SQLAlchemy models so their tables and relationships are registered."""

from orm_models.book import Book, BookStatus
from orm_models.category import Category
from orm_models.review import Review
from orm_models.user import (
    AccountStatus,
    AuthorProfile,
    EmailVerificationToken,
    PasswordResetToken,
    RevokedAccessToken,
    User,
    UserRole,
)

__all__ = [
    "AccountStatus",
    "AuthorProfile",
    "Book",
    "BookStatus",
    "Category",
    "EmailVerificationToken",
    "PasswordResetToken",
    "RevokedAccessToken",
    "Review",
    "User",
    "UserRole",
]

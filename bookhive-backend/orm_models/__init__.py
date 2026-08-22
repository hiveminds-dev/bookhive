"""Import all SQLAlchemy models so their tables and relationships are registered."""

from orm_models.book import Book, BookStatus
from orm_models.category import Category
from orm_models.user import (
    AccountStatus,
    AuthorProfile,
    EmailVerificationToken,
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
    "RevokedAccessToken",
    "User",
    "UserRole",
]

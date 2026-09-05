from sqlalchemy.orm import configure_mappers

import orm_models  # noqa: F401
from database import Base


def test_all_orm_models_are_registered():
    assert set(Base.metadata.tables) == {
        "author_profiles",
        "author_rejection_logs",
        "book_rejection_logs",
        "books",
        "categories",
        "email_verification_tokens",
        "password_reset_tokens",
        "reader_profiles",
        "revoked_access_tokens",
        "reviews",
        "users",
    }


def test_all_orm_relationships_can_be_configured():
    configure_mappers()

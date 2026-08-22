from sqlalchemy.orm import configure_mappers

import orm_models  # noqa: F401
from database import Base


def test_all_orm_models_are_registered():
    assert set(Base.metadata.tables) == {
        "author_profiles",
        "books",
        "categories",
        "email_verification_tokens",
        "password_reset_tokens",
        "revoked_access_tokens",
        "users",
    }


def test_all_orm_relationships_can_be_configured():
    configure_mappers()

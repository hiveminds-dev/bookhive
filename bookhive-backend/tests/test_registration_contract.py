import pytest
from pydantic import ValidationError

from schemas.author import AuthorRegistrationRequest
from schemas.user import UserCreate


def test_reader_registration_accepts_valid_contract():
    request = UserCreate(
        full_name="John Doe",
        username="john_reads",
        email="john@example.com",
        password="SecurePass123!",
    )

    assert request.full_name == "John Doe"
    assert request.username == "john_reads"
    assert request.email == "john@example.com"


@pytest.mark.parametrize(
    "username",
    [
        "12reader",
        "_reader",
        "reader-name",
        "ab",
        "a" * 51,
    ],
)
def test_reader_registration_rejects_invalid_username(username: str):
    with pytest.raises(ValidationError):
        UserCreate(
            full_name="John Doe",
            username=username,
            email="john@example.com",
            password="SecurePass123!",
        )


def test_author_registration_accepts_valid_contract():
    request = AuthorRegistrationRequest(
        full_name="Jane Smith",
        username="js_archer",
        email="jane@example.com",
        password="SecurePass123!",
        pen_name="J. S. Archer",
        country="Sri Lanka",
        preferred_language="English",
        short_bio="Independent fiction author.",
    )

    assert request.username == "js_archer"
    assert request.preferred_language == "English"
    assert request.short_bio == "Independent fiction author."


def test_author_registration_requires_profile_fields():
    with pytest.raises(ValidationError):
        AuthorRegistrationRequest(
            full_name="Jane Smith",
            username="js_archer",
            email="jane@example.com",
            password="SecurePass123!",
            pen_name="J. S. Archer",
        )

"""Tests the ratings and reviews API endpoints."""

from datetime import UTC, datetime
from unittest.mock import ANY, AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from dependencies import require_reader
from main import app
from orm_models.user import AccountStatus, User, UserRole
from routers.review_router import review_service
from schemas.review import PublicReviewResponse
from services.review_service import (
    ReviewConflictError,
    ReviewNotFoundError,
    ReviewPermissionError,
    ReviewValidationError,
)


def make_reader_user(user_id: int = 5, username: str = "bookworm") -> User:
    return User(
        id=user_id,
        full_name="Book Worm",
        username=username,
        email="reader@bookhive.test",
        password_hash="hashed",
        email_verified=True,
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
    )


def make_review_response(
    review_id: int = 1,
    book_id: int = 10,
    user_id: int = 5,
    reader_name: str = "bookworm",
    rating: int = 5,
    comment: str | None = "Loved this book!",
) -> PublicReviewResponse:
    return PublicReviewResponse(
        id=review_id,
        book_id=book_id,
        user_id=user_id,
        reader_name=reader_name,
        rating=rating,
        comment=comment,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )


async def override_database_session():
    yield AsyncMock()


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_review_success(monkeypatch):
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    review_mock = AsyncMock(
        return_value=make_review_response(
            review_id=1,
            book_id=10,
            user_id=5,
            rating=5,
            comment="Excellent read!",
        )
    )
    monkeypatch.setattr(review_service, "create_review", review_mock)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/books/10/reviews",
            json={"rating": 5, "comment": "Excellent read!"},
        )

    assert response.status_code == 201
    payload = response.json()
    assert payload["message"] == "Review submitted successfully"
    assert payload["data"]["id"] == 1
    assert payload["data"]["rating"] == 5
    assert payload["data"]["comment"] == "Excellent read!"
    review_mock.assert_awaited_once_with(
        session=ANY,
        book_id=10,
        reader_id=5,
        review_data=ANY,
    )


@pytest.mark.asyncio
async def test_create_duplicate_review_returns_409(monkeypatch):
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    monkeypatch.setattr(
        review_service,
        "create_review",
        AsyncMock(
            side_effect=ReviewConflictError(
                "You have already submitted a review for this book"
            )
        ),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/books/10/reviews",
            json={"rating": 4, "comment": "Duplicate attempt"},
        )

    assert response.status_code == 409
    assert response.json()["detail"] == "You have already submitted a review for this book"


@pytest.mark.asyncio
async def test_create_review_on_unpublished_or_missing_book_returns_404(monkeypatch):
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    monkeypatch.setattr(
        review_service,
        "create_review",
        AsyncMock(side_effect=ReviewNotFoundError("Published book not found")),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/books/999/reviews",
            json={"rating": 5, "comment": "Should not work"},
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "Published book not found"


@pytest.mark.asyncio
async def test_create_review_unauthenticated_returns_401():
    app.dependency_overrides[get_db_session] = override_database_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/books/10/reviews",
            json={"rating": 5, "comment": "No auth"},
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_review_invalid_rating_range():
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/books/10/reviews",
            json={"rating": 6, "comment": "Invalid rating"},
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_book_reviews_public(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session

    mock_reviews = [
        make_review_response(review_id=1, book_id=10, rating=5),
        make_review_response(review_id=2, book_id=10, rating=4),
    ]
    monkeypatch.setattr(
        review_service,
        "get_book_reviews",
        AsyncMock(return_value=mock_reviews),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/books/10/reviews")

    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == "Book reviews retrieved successfully"
    assert len(payload["data"]) == 2


@pytest.mark.asyncio
async def test_update_review_success(monkeypatch):
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    updated_mock = make_review_response(
        review_id=1,
        book_id=10,
        user_id=5,
        rating=4,
        comment="Updated comment",
    )
    monkeypatch.setattr(
        review_service,
        "update_review",
        AsyncMock(return_value=updated_mock),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.patch(
            "/api/reviews/1",
            json={"rating": 4, "comment": "Updated comment"},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == "Review updated successfully"
    assert payload["data"]["rating"] == 4
    assert payload["data"]["comment"] == "Updated comment"


@pytest.mark.asyncio
async def test_update_review_forbidden_for_non_owner(monkeypatch):
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    monkeypatch.setattr(
        review_service,
        "update_review",
        AsyncMock(
            side_effect=ReviewPermissionError(
                "You can only edit your own review"
            )
        ),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.patch(
            "/api/reviews/99",
            json={"rating": 3},
        )

    assert response.status_code == 403
    assert response.json()["detail"] == "You can only edit your own review"


@pytest.mark.asyncio
async def test_delete_review_success(monkeypatch):
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    delete_mock = AsyncMock(return_value=None)
    monkeypatch.setattr(review_service, "delete_review", delete_mock)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.delete("/api/reviews/1")

    assert response.status_code == 200
    assert response.json()["message"] == "Review deleted successfully"
    delete_mock.assert_awaited_once_with(
        session=ANY,
        review_id=1,
        reader_id=5,
    )


@pytest.mark.asyncio
async def test_delete_review_forbidden_for_non_owner(monkeypatch):
    reader = make_reader_user(user_id=5)
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_reader] = lambda: reader

    monkeypatch.setattr(
        review_service,
        "delete_review",
        AsyncMock(
            side_effect=ReviewPermissionError(
                "You can only delete your own review"
            )
        ),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.delete("/api/reviews/99")

    assert response.status_code == 403
    assert response.json()["detail"] == "You can only delete your own review"

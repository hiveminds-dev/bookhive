"""Tests the public Book Details API endpoint."""

from datetime import UTC, datetime
from unittest.mock import ANY, AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from main import app
from orm_models.book import BookStatus
from routers.book_router import book_service
from schemas.book import (
    BookDetailsAuthorResponse,
    BookDetailsCategoryResponse,
    BookDetailsResponse,
)
from services.book_service import BookNotFoundError


async def override_database_session():
    yield AsyncMock()


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()

    yield

    app.dependency_overrides.clear()


def make_book_details() -> BookDetailsResponse:
    return BookDetailsResponse(
        id=12,
        title="Beyond Good and Evil",
        description=(
            "A prelude to a philosophy of the future."
        ),
        language="English",
        reading_level="Advanced",
        cover_url=(
            "/storage/covers/book-cover.jpg"
        ),
        pdf_url="/storage/books/book.pdf",
        status=BookStatus.PUBLISHED,
        published_at=datetime.now(UTC),
        can_read=True,
        can_download=True,
        author=BookDetailsAuthorResponse(
            id=7,
            display_name="E. V. Sterling",
            username="eleanorv",
            biography=(
                "Author of classical philosophy."
            ),
            profile_image_url=(
                "/storage/authors/sterling.jpg"
            ),
        ),
        category=BookDetailsCategoryResponse(
            id=4,
            name="Philosophy",
        ),
    )


@pytest.mark.asyncio
async def test_book_details_endpoint_is_public(
    monkeypatch,
):
    app.dependency_overrides[
        get_db_session
    ] = override_database_session

    get_details_mock = AsyncMock(
        return_value=make_book_details(),
    )

    monkeypatch.setattr(
        book_service,
        "get_public_book_details",
        get_details_mock,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get(
            "/api/books/12"
        )

    assert response.status_code == 200

    payload = response.json()

    assert payload["message"] == (
        "Book details retrieved successfully"
    )
    assert payload["data"]["id"] == 12
    assert payload["data"]["title"] == (
        "Beyond Good and Evil"
    )
    assert payload["data"]["status"] == (
        BookStatus.PUBLISHED
    )
    assert payload["data"]["author"][
        "display_name"
    ] == "E. V. Sterling"
    assert payload["data"]["category"]["name"] == (
        "Philosophy"
    )
    assert payload["data"]["can_read"] is True
    assert payload["data"]["can_download"] is True

    get_details_mock.assert_awaited_once_with(
        session=ANY,
        book_id=12,
    )


@pytest.mark.asyncio
async def test_missing_or_unpublished_book_returns_404(
    monkeypatch,
):
    app.dependency_overrides[
        get_db_session
    ] = override_database_session

    get_details_mock = AsyncMock(
        side_effect=BookNotFoundError(
            "Published book not found"
        ),
    )

    monkeypatch.setattr(
        book_service,
        "get_public_book_details",
        get_details_mock,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get(
            "/api/books/999"
        )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Published book not found",
    }

    get_details_mock.assert_awaited_once_with(
        session=ANY,
        book_id=999,
    )
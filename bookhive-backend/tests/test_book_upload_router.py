"""Tests authentication and approval rules for upload endpoints."""

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from dependencies import get_current_user
from main import app
from orm_models.user import AccountStatus, UserRole

UPLOAD_CASES = [
    (
        "/api/books/1/upload/pdf",
        "book.pdf",
        "application/pdf",
    ),
    (
        "/api/books/1/upload/cover",
        "cover.png",
        "image/png",
    ),
]


async def override_database_session():
    yield AsyncMock()


async def override_pending_author():
    return SimpleNamespace(
        id=7,
        role=UserRole.AUTHOR,
        account_status=AccountStatus.PENDING,
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("endpoint", "filename", "content_type"),
    UPLOAD_CASES,
)
async def test_upload_requires_authentication(
    endpoint,
    filename,
    content_type,
):
    app.dependency_overrides.clear()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.post(
                endpoint,
                files={
                    "file": (
                        filename,
                        b"test content",
                        content_type,
                    )
                },
            )

        assert response.status_code == 401
        assert response.json()["detail"] == (
            "Authentication required"
        )

    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("endpoint", "filename", "content_type"),
    UPLOAD_CASES,
)
async def test_pending_author_cannot_upload(
    endpoint,
    filename,
    content_type,
):
    app.dependency_overrides.clear()

    app.dependency_overrides[
        get_db_session
    ] = override_database_session

    app.dependency_overrides[
        get_current_user
    ] = override_pending_author

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.post(
                endpoint,
                files={
                    "file": (
                        filename,
                        b"test content",
                        content_type,
                    )
                },
            )

        assert response.status_code == 403
        assert response.json()["detail"] == (
            "Your author account is not approved"
        )

    finally:
        app.dependency_overrides.clear()
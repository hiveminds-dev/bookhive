"""Tests reader and user profile endpoints: GET, PATCH, upload, and delete."""

import io
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image

from database import get_db_session
from dependencies import get_current_user
from main import app
from orm_models.user import AccountStatus, UserRole
from routers import user_router


def create_test_image(format_name: str = "JPEG") -> bytes:
    """Generate a small valid test image in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(255, 200, 50))
    img.save(buf, format=format_name)
    return buf.getvalue()


async def override_database_session():
    yield AsyncMock()


async def override_current_reader():
    return SimpleNamespace(
        id=42,
        full_name="Liam Henderson",
        username="liamh",
        email="liam.henderson@mail.com",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
        created_at=datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC),
        updated_at=datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC),
        reader_profile=SimpleNamespace(
            country="United States",
            preferred_language="English",
            short_bio="Avid digital reader and book reviewer.",
            profile_image_path="storage/profiles/avatar_42.jpg",
        ),
        author_profile=None,
    )


async def override_reader_without_profile():
    return SimpleNamespace(
        id=99,
        full_name="New Reader",
        username="newreader",
        email="newreader@mail.com",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
        email_verified=False,
        created_at=datetime(2026, 2, 1, 12, 0, 0, tzinfo=UTC),
        updated_at=datetime(2026, 2, 1, 12, 0, 0, tzinfo=UTC),
        reader_profile=None,
        author_profile=None,
    )


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_profile_requires_authentication():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/users/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


@pytest.mark.asyncio
async def test_get_profile_returns_authenticated_reader_data(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_current_reader

    # Mock user_service.get_current_user_profile to return a full response
    mock_profile = {
        "id": 42,
        "full_name": "Liam Henderson",
        "username": "liamh",
        "email": "liam.henderson@mail.com",
        "role": "reader",
        "account_status": "active",
        "email_verified": True,
        "created_at": "2026-01-01T12:00:00Z",
        "updated_at": "2026-01-01T12:00:00Z",
        "country": "United States",
        "preferred_language": "English",
        "short_bio": "Avid digital reader and book reviewer.",
        "profile_image_path": "storage/profiles/avatar_42.jpg",
        "profile_image_url": "/storage/profiles/avatar_42.jpg",
    }
    monkeypatch.setattr(
        user_router.user_service,
        "get_current_user_profile",
        AsyncMock(return_value=mock_profile),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/users/me")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 42
    assert data["username"] == "liamh"
    assert data["email"] == "liam.henderson@mail.com"
    assert data["country"] == "United States"
    assert data["profile_image_url"] == "/storage/profiles/avatar_42.jpg"
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_get_profile_handles_user_without_profile_row(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_reader_without_profile

    mock_profile = {
        "id": 99,
        "full_name": "New Reader",
        "username": "newreader",
        "email": "newreader@mail.com",
        "role": "reader",
        "account_status": "active",
        "email_verified": False,
        "created_at": "2026-02-01T12:00:00Z",
        "updated_at": "2026-02-01T12:00:00Z",
        "country": None,
        "preferred_language": None,
        "short_bio": None,
        "profile_image_path": None,
        "profile_image_url": None,
    }
    monkeypatch.setattr(
        user_router.user_service,
        "get_current_user_profile",
        AsyncMock(return_value=mock_profile),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/users/me")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 99
    assert data["country"] is None
    assert data["profile_image_url"] is None


@pytest.mark.asyncio
async def test_patch_profile_requires_authentication():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch("/api/users/me", json={"full_name": "New Name"})

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_patch_profile_successful_update(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_current_reader

    mock_updated = {
        "id": 42,
        "full_name": "Liam Updated",
        "username": "liam_new",
        "email": "liam.henderson@mail.com",
        "role": "reader",
        "account_status": "active",
        "email_verified": True,
        "created_at": "2026-01-01T12:00:00Z",
        "updated_at": "2026-01-01T13:00:00Z",
        "country": "Canada",
        "preferred_language": "French",
        "short_bio": "Updated bio here.",
        "profile_image_path": None,
        "profile_image_url": None,
    }
    update_mock = AsyncMock(return_value=mock_updated)
    monkeypatch.setattr(
        user_router.user_service,
        "update_current_user_profile",
        update_mock,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch(
            "/api/users/me",
            json={
                "full_name": "Liam Updated",
                "username": "liam_new",
                "country": "Canada",
                "preferred_language": "French",
                "short_bio": "Updated bio here.",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Liam Updated"
    assert data["username"] == "liam_new"
    assert data["country"] == "Canada"
    update_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_patch_profile_rejects_blank_full_name():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_current_reader

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch(
            "/api/users/me",
            json={"full_name": " "},
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_patch_profile_rejects_invalid_username_format():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_current_reader

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch(
            "/api/users/me",
            json={"username": "123invalid"},
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_patch_profile_rejects_extra_fields():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_current_reader

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch(
            "/api/users/me",
            json={"unsupported_field": "value"},
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_upload_profile_image_success(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_current_reader

    mock_upload_resp = {
        "message": "Profile image uploaded successfully",
        "profile_image_path": "storage/profiles/test_abc.jpg",
        "profile_image_url": "/storage/profiles/test_abc.jpg",
    }
    upload_mock = AsyncMock(return_value=mock_upload_resp)
    monkeypatch.setattr(
        user_router.user_service,
        "upload_profile_image",
        upload_mock,
    )

    image_bytes = create_test_image("JPEG")
    files = {"file": ("avatar.jpg", image_bytes, "image/jpeg")}

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.post(
            "/api/users/me/profile-image",
            files=files,
        )

    assert response.status_code == 200
    data = response.json()
    assert data["profile_image_url"] == "/storage/profiles/test_abc.jpg"
    upload_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_delete_profile_image_success(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_current_reader

    delete_mock = AsyncMock(return_value={"message": "Profile image removed successfully"})
    monkeypatch.setattr(
        user_router.user_service,
        "delete_profile_image",
        delete_mock,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.delete("/api/users/me/profile-image")

    assert response.status_code == 200
    assert response.json()["message"] == "Profile image removed successfully"
    delete_mock.assert_awaited_once()

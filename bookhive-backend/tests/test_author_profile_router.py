"""Tests author-profile authentication and ownership rules."""

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from dependencies import get_current_user
from main import app
from orm_models.user import AccountStatus, UserRole
from routers import author_profile_router


async def override_database_session():
    yield AsyncMock()


async def override_author():
    return SimpleNamespace(
        id=7,
        role=UserRole.AUTHOR,
        account_status=AccountStatus.APPROVED,
    )


async def override_reader():
    return SimpleNamespace(
        id=7,
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
    )


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_author_profile_requires_authentication():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/authors/profile/7")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


@pytest.mark.asyncio
async def test_reader_cannot_access_author_profile():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_reader

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/authors/profile/7")

    assert response.status_code == 403
    assert response.json()["detail"] == "Author access is required"


@pytest.mark.asyncio
async def test_author_cannot_access_another_profile():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_author

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch(
            "/api/authors/profile/8",
            json={"pen_name": "Not Mine"},
        )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "Authors can only manage their own profile"
    )


@pytest.mark.asyncio
async def test_author_can_update_own_profile(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_author
    update_profile = AsyncMock(
        return_value={
            "id": 3,
            "user_id": 7,
            "pen_name": "E. V. Sterling",
            "country": "United Kingdom",
            "preferred_language": "English",
            "short_bio": "Updated biography",
            "profile_image_path": None,
        }
    )
    monkeypatch.setattr(
        author_profile_router.profile_service,
        "update_profile",
        update_profile,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch(
            "/api/authors/profile/7",
            json={"short_bio": "Updated biography"},
        )

    assert response.status_code == 200
    assert response.json()["user_id"] == 7
    update_profile.assert_awaited_once()


@pytest.mark.asyncio
async def test_blank_pen_name_is_rejected():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_author

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.patch(
            "/api/authors/profile/7",
            json={"pen_name": "   "},
        )

    assert response.status_code == 422

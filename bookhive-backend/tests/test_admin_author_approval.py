"""Tests for admin author approval and rejection workflow."""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from dependencies import get_current_user
from main import app
from orm_models.user import AccountStatus, UserRole
from routers import admin_router


async def override_database_session():
    yield AsyncMock()


async def override_admin_user():
    return SimpleNamespace(
        id=1,
        full_name="Marcus Vance",
        username="marcusv",
        email="marcus.vance@bookhive.com",
        role=UserRole.ADMIN,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
    )


async def override_reader_user():
    return SimpleNamespace(
        id=2,
        full_name="Liam Henderson",
        username="liamh",
        email="liam.henderson@mail.com",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
    )


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_author_endpoints_require_authentication():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # GET /api/admin/authors
        resp = await client.get("/api/admin/authors")
        assert resp.status_code == 401

        # GET /api/admin/authors/stats
        stats_resp = await client.get("/api/admin/authors/stats")
        assert stats_resp.status_code == 401

        # POST approve
        approve_resp = await client.post("/api/admin/authors/10/approve")
        assert approve_resp.status_code == 401

        # POST reject
        reject_resp = await client.post(
            "/api/admin/authors/10/reject",
            json={"rejection_reason": "Not enough info."},
        )
        assert reject_resp.status_code == 401


@pytest.mark.asyncio
async def test_reader_cannot_access_admin_author_endpoints():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_reader_user

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/admin/authors")
        assert resp.status_code == 403

        approve_resp = await client.post("/api/admin/authors/10/approve")
        assert approve_resp.status_code == 403

        reject_resp = await client.post(
            "/api/admin/authors/10/reject",
            json={"rejection_reason": "Not enough info."},
        )
        assert reject_resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_list_author_applications(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_admin_user

    mock_authors = [
        {
            "id": 10,
            "user_id": 10,
            "full_name": "Julian Thorne",
            "pen_name": "J. Thistle",
            "email": "j.thorne@writes.org",
            "country": "United Kingdom",
            "account_status": "pending",
            "profile_image_path": None,
            "bio": "History and literature author.",
            "applied_date": "2026-01-10T10:00:00Z",
            "rejection_reason": None,
            "rejection_logs": [],
        }
    ]
    monkeypatch.setattr(
        admin_router.admin_service,
        "get_author_applications",
        AsyncMock(return_value=mock_authors),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/admin/authors?status_filter=pending")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["full_name"] == "Julian Thorne"
        assert data[0]["pen_name"] == "J. Thistle"
        assert data[0]["account_status"] == "pending"


@pytest.mark.asyncio
async def test_admin_can_approve_author(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_admin_user

    approve_mock = AsyncMock(return_value=True)
    monkeypatch.setattr(
        admin_router.admin_service,
        "approve_author",
        approve_mock,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post("/api/admin/authors/10/approve")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Author approved successfully."
        approve_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_admin_can_reject_author_with_reason(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_admin_user

    reject_mock = AsyncMock(return_value=True)
    monkeypatch.setattr(
        admin_router.admin_service,
        "reject_author",
        reject_mock,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post(
            "/api/admin/authors/10/reject",
            json={
                "rejection_reason": "The submitted author profile does not contain sufficient verification information."
            },
        )
        assert resp.status_code == 200
        assert resp.json()["message"] == "Author rejected successfully."
        reject_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_reject_author_requires_rejection_reason():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_admin_user

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Missing payload
        resp1 = await client.post("/api/admin/authors/10/reject")
        assert resp1.status_code == 422

        # Blank / whitespace-only reason
        resp2 = await client.post(
            "/api/admin/authors/10/reject",
            json={"rejection_reason": "   "},
        )
        assert resp2.status_code == 422

        # Overly long reason (> 500 chars)
        resp3 = await client.post(
            "/api/admin/authors/10/reject",
            json={"rejection_reason": "x" * 501},
        )
        assert resp3.status_code == 422


@pytest.mark.asyncio
async def test_approve_or_reject_unknown_author_returns_404(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_admin_user

    monkeypatch.setattr(
        admin_router.admin_service,
        "approve_author",
        AsyncMock(return_value=False),
    )
    monkeypatch.setattr(
        admin_router.admin_service,
        "reject_author",
        AsyncMock(return_value=False),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        approve_resp = await client.post("/api/admin/authors/9999/approve")
        assert approve_resp.status_code == 404
        assert approve_resp.json()["detail"] == "Author user not found."

        reject_resp = await client.post(
            "/api/admin/authors/9999/reject",
            json={"rejection_reason": "Author missing."},
        )
        assert reject_resp.status_code == 404
        assert reject_resp.json()["detail"] == "Author user not found."


@pytest.mark.asyncio
async def test_non_author_user_cannot_be_approved_or_rejected(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_admin_user

    monkeypatch.setattr(
        admin_router.admin_service,
        "approve_author",
        AsyncMock(side_effect=ValueError("User is not an author application.")),
    )
    monkeypatch.setattr(
        admin_router.admin_service,
        "reject_author",
        AsyncMock(side_effect=ValueError("User is not an author application.")),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        approve_resp = await client.post("/api/admin/authors/2/approve")
        assert approve_resp.status_code == 400
        assert "not an author" in approve_resp.json()["detail"]

        reject_resp = await client.post(
            "/api/admin/authors/2/reject",
            json={"rejection_reason": "Invalid user."},
        )
        assert reject_resp.status_code == 400
        assert "not an author" in reject_resp.json()["detail"]

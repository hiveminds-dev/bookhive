from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException, status
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from dependencies import get_current_user
from main import app
from orm_models.user import AccountStatus, UserRole
from schemas.admin_schemas import (
    AuthorDetailAdminResponse,
    BookAdminResponse,
    CategoryAdminItem,
    PlatformStatisticsResponse,
    ReaderDetailAdminResponse,
)


async def override_database_session():
    yield AsyncMock()


async def override_admin_user():
    return SimpleNamespace(
        id=1,
        full_name="Samantha Reed",
        username="samanthar",
        email="samantha.reed@bookhive.com",
        role=UserRole.ADMIN,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
    )


async def override_reader_user():
    return SimpleNamespace(
        id=7,
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
async def test_admin_endpoints_unauthorized_without_token():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/admin/dashboard/stats")
        assert response.status_code == 401

        books_resp = await client.get("/api/admin/books")
        assert books_resp.status_code == 401

        authors_resp = await client.get("/api/admin/authors")
        assert authors_resp.status_code == 401

        readers_resp = await client.get("/api/admin/readers")
        assert readers_resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_endpoints_forbidden_for_reader():
    app.dependency_overrides[get_current_user] = override_reader_user
    app.dependency_overrides[get_db_session] = override_database_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/admin/books")
        assert resp.status_code == 403

        resp2 = await client.get("/api/admin/readers/7")
        assert resp2.status_code == 403

        resp3 = await client.get("/api/admin/authors/10")
        assert resp3.status_code == 403


@pytest.mark.asyncio
async def test_get_book_by_id_success():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    sample_book = BookAdminResponse(
        id=5,
        title="Test Book",
        author_name="Author",
        category_name="Tech",
        language="English",
        reading_level="Advanced",
        status="PUBLISHED",
        cover_image_path="storage/covers/5.jpg",
        page_count=200,
        view_count=50,
        download_count=10,
        average_rating=4.5,
        review_count=2,
        created_at=datetime.now(UTC),
        published_at=datetime.now(UTC),
    )

    with patch(
        "routers.admin_router.admin_service.get_book_by_id",
        new=AsyncMock(return_value=sample_book),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get("/api/admin/books/5")
            assert resp.status_code == 200
            data = resp.json()
            assert data["id"] == 5
            assert data["title"] == "Test Book"
            assert data["view_count"] == 50
            assert data["download_count"] == 10


@pytest.mark.asyncio
async def test_get_book_by_id_not_found():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.get_book_by_id",
        new=AsyncMock(return_value=None),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get("/api/admin/books/999")
            assert resp.status_code == 404
            assert "Book not found" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_approve_book_success_and_invalid_state_conflict():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.approve_book",
        new=AsyncMock(return_value=True),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post("/api/admin/books/10/approve")
            assert resp.status_code == 200
            assert "approved" in resp.json()["message"]

    # Invalid state transition raises 409 Conflict
    with patch(
        "routers.admin_router.admin_service.approve_book",
        new=AsyncMock(
            side_effect=HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot approve book with status 'PUBLISHED'. Only books in 'PENDING_REVIEW' can be approved.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post("/api/admin/books/10/approve")
            assert resp.status_code == 409
            assert "Cannot approve" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_reject_book_success_and_missing_reason_validation():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.reject_book",
        new=AsyncMock(return_value=True),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                "/api/admin/books/10/reject",
                json={"status": "REJECTED", "rejection_reason": "Low quality manuscript."},
            )
            assert resp.status_code == 200
            assert "rejected" in resp.json()["message"]

    # Missing reason raises 422
    with patch(
        "routers.admin_router.admin_service.reject_book",
        new=AsyncMock(
            side_effect=HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Rejection reason is required when rejecting a book submission.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                "/api/admin/books/10/reject",
                json={"status": "REJECTED", "rejection_reason": ""},
            )
            assert resp.status_code == 422
            assert "Rejection reason is required" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_update_book_status_transitions():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    # Valid: PUBLISHED -> DEACTIVATED
    with patch(
        "routers.admin_router.admin_service.update_book_status",
        new=AsyncMock(return_value=True),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.put(
                "/api/admin/books/10/status",
                json={"status": "DEACTIVATED"},
            )
            assert resp.status_code == 200
            assert "DEACTIVATED" in resp.json()["message"]

    # Invalid: DRAFT -> PUBLISHED raises 409
    with patch(
        "routers.admin_router.admin_service.update_book_status",
        new=AsyncMock(
            side_effect=HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot change status of a DRAFT book directly from Admin. Author must submit for review first.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.put(
                "/api/admin/books/10/status",
                json={"status": "PUBLISHED"},
            )
            assert resp.status_code == 409
            assert "DRAFT book" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_system_logs_returns_empty_list():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/admin/system-logs")
        assert resp.status_code == 200
        assert resp.json() == []


@pytest.mark.asyncio
async def test_get_reader_detail_endpoint():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    sample_reader = ReaderDetailAdminResponse(
        id=7,
        full_name="Liam Henderson",
        username="liamh",
        email="liam.henderson@mail.com",
        account_status="active",
        email_verified=True,
        joined_at=datetime.now(UTC),
        country="United Kingdom",
        short_bio="Avid philosophy reader",
        review_count=1,
        reviews=[
            {
                "id": 1,
                "book_id": 1,
                "book_title": "Beyond Good and Evil",
                "book_cover_url": "/storage/covers/1.jpg",
                "book_author": "E. V. Sterling",
                "rating": 5,
                "comment": "Superb work",
                "created_at": "2026-08-30",
            }
        ],
    )

    with patch(
        "routers.admin_router.admin_service.get_reader_detail",
        new=AsyncMock(return_value=sample_reader),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get("/api/admin/readers/7")
            assert resp.status_code == 200
            data = resp.json()
            assert data["id"] == 7
            assert data["full_name"] == "Liam Henderson"
            assert data["review_count"] == 1
            assert len(data["reviews"]) == 1


@pytest.mark.asyncio
async def test_get_author_detail_endpoint():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    sample_author = AuthorDetailAdminResponse(
        id=15,
        full_name="Eleanor Vance",
        username="eleanorv",
        email="eleanor.v@lumina.com",
        account_status="approved",
        email_verified=True,
        created_at=datetime.now(UTC),
        pen_name="E. V. Sterling",
        country="United Kingdom",
        short_bio="Philosophy author",
        profile_image_path="storage/authors/1.jpg",
        total_books=2,
        total_views=2500,
        total_downloads=800,
        average_rating=4.8,
        published_books=[
            {
                "id": 1,
                "title": "Beyond Good and Evil",
                "category_name": "Philosophy",
                "status": "PUBLISHED",
                "cover_image_path": "storage/covers/1.jpg",
                "view_count": 2500,
                "download_count": 800,
                "average_rating": 4.8,
                "rejection_reason": None,
                "created_at": datetime.now(UTC),
                "published_at": datetime.now(UTC),
            }
        ],
        pending_books=[],
        rejected_books=[],
        draft_books=[],
        rejection_logs=[],
    )

    with patch(
        "routers.admin_router.admin_service.get_author_detail",
        new=AsyncMock(return_value=sample_author),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get("/api/admin/authors/15")
            assert resp.status_code == 200
            data = resp.json()
            assert data["id"] == 15
            assert data["pen_name"] == "E. V. Sterling"
            assert data["total_books"] == 2
            assert len(data["published_books"]) == 1


@pytest.mark.asyncio
async def test_category_duplicate_and_safe_delete_conflict():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    # Duplicate category conflict returns 409
    with patch(
        "routers.admin_router.admin_service.create_category",
        new=AsyncMock(
            side_effect=HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category 'Technology' already exists.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                "/api/admin/categories",
                json={"name": "Technology", "description": "Tech books"},
            )
            assert resp.status_code == 409
            assert "already exists" in resp.json()["detail"]

    # Safe delete blocked by referencing books returns 409
    with patch(
        "routers.admin_router.admin_service.delete_category",
        new=AsyncMock(
            side_effect=HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete category 'Technology' because 5 book(s) reference it.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.delete("/api/admin/categories/3")
            assert resp.status_code == 409
            assert "reference it" in resp.json()["detail"]

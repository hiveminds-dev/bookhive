"""Tests for Author Book Submission, Review, and Status Tracking workflows."""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from dependencies import get_current_user
from main import app
from orm_models.book import Book, BookStatus
from orm_models.user import AccountStatus, UserRole
from routers import book_router


async def override_database_session():
    yield AsyncMock()


async def override_approved_author():
    return SimpleNamespace(
        id=10,
        full_name="Eleanor Vance",
        username="eleanorv",
        email="eleanor.v@lumina.com",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.APPROVED,
        email_verified=True,
    )


async def override_pending_author():
    return SimpleNamespace(
        id=11,
        full_name="Julian Thorne",
        username="julian_thorne",
        email="julian.t@authors.net",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.PENDING,
        email_verified=True,
    )


async def override_reader():
    return SimpleNamespace(
        id=12,
        full_name="Liam Henderson",
        username="liamh",
        email="liam.h@readers.org",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
    )


async def override_other_author():
    return SimpleNamespace(
        id=99,
        full_name="Other Author",
        username="othera",
        email="other.a@authors.net",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.APPROVED,
        email_verified=True,
    )


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_unauthenticated_requests_are_rejected():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/books/mine")
        assert resp.status_code == 401

        resp = await client.post("/api/books/", json={"category_id": 1, "title": "Test Book"})
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_unapproved_author_cannot_submit_or_list_books():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_pending_author

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/books/mine")
        assert resp.status_code == 403
        assert "not approved" in resp.json()["detail"].lower()

        resp = await client.post(
            "/api/books/",
            json={"category_id": 1, "title": "Draft Book"},
        )
        assert resp.status_code == 403


@pytest.mark.asyncio
async def test_reader_cannot_access_author_book_endpoints():
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_reader

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/books/mine")
        assert resp.status_code == 403
        assert "author access is required" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_approved_author_can_create_draft_book(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_approved_author

    mock_book = Book(
        id=1,
        author_id=10,
        category_id=2,
        title="Philosophy of Silence",
        description="A book on deep thought.",
        language="English",
        reading_level="Beginner",
        status=BookStatus.DRAFT,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    monkeypatch.setattr(
        book_router.book_service,
        "create_draft",
        AsyncMock(return_value=mock_book),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post(
            "/api/books/",
            json={
                "category_id": 2,
                "title": "Philosophy of Silence",
                "description": "A book on deep thought.",
                "language": "English",
                "reading_level": "Beginner",
            },
        )
        assert resp.status_code == 201
        data = resp.json()["data"]
        assert data["id"] == 1
        assert data["title"] == "Philosophy of Silence"
        assert data["status"] == "DRAFT"
        assert data["author_id"] == 10


@pytest.mark.asyncio
async def test_author_can_list_own_books(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_approved_author

    mock_books = [
        Book(
            id=1,
            author_id=10,
            category_id=2,
            title="Book One",
            description="First book",
            language="English",
            status=BookStatus.DRAFT,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        ),
        Book(
            id=2,
            author_id=10,
            category_id=3,
            title="Book Two",
            description="Second book",
            language="English",
            status=BookStatus.PENDING_REVIEW,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
            submitted_at=datetime.now(UTC),
        ),
    ]

    monkeypatch.setattr(
        book_router.book_service,
        "list_author_books",
        AsyncMock(return_value=mock_books),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/books/mine")
        assert resp.status_code == 200
        items = resp.json()["data"]
        assert len(items) == 2
        assert items[0]["title"] == "Book One"
        assert items[1]["status"] == "PENDING_REVIEW"


@pytest.mark.asyncio
async def test_author_can_get_own_book_details_with_rejection_reason(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_approved_author

    mock_book = Book(
        id=5,
        author_id=10,
        category_id=2,
        title="Rejected Manuscript",
        description="Fix the cover and resubmit.",
        language="English",
        cover_image_path="storage/covers/sample.jpg",
        pdf_path="storage/books/sample.pdf",
        status=BookStatus.REJECTED,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        submitted_at=datetime.now(UTC),
    )
    # Mock property
    monkeypatch.setattr(
        Book,
        "rejection_reason",
        property(lambda self: "Cover resolution too low; please upload a higher-quality cover."),
    )

    monkeypatch.setattr(
        book_router.book_service,
        "get_author_book",
        AsyncMock(return_value=mock_book),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/books/mine/5")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["id"] == 5
        assert data["status"] == "REJECTED"
        assert "Cover resolution too low" in data["rejection_reason"]


@pytest.mark.asyncio
async def test_author_cannot_access_or_edit_another_authors_book(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_other_author

    from services.book_service import BookPermissionError

    monkeypatch.setattr(
        book_router.book_service,
        "get_author_book",
        AsyncMock(side_effect=BookPermissionError("You do not have permission to access this book")),
    )
    monkeypatch.setattr(
        book_router.book_service,
        "update_book",
        AsyncMock(side_effect=BookPermissionError("You do not have permission to access this book")),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/books/mine/1")
        assert resp.status_code == 403

        resp_update = await client.patch("/api/books/1", json={"title": "Hacked Title"})
        assert resp_update.status_code == 403


@pytest.mark.asyncio
async def test_submit_book_for_review_success(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_approved_author

    mock_submitted_book = Book(
        id=1,
        author_id=10,
        category_id=2,
        title="Ready Book",
        status=BookStatus.PENDING_REVIEW,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        submitted_at=datetime.now(UTC),
    )

    monkeypatch.setattr(
        book_router.book_service,
        "submit_book",
        AsyncMock(return_value=mock_submitted_book),
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.patch("/api/books/1/submit")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["status"] == "PENDING_REVIEW"
        assert resp.json()["message"] == "Book submitted for review successfully"


@pytest.mark.asyncio
async def test_author_can_delete_draft_or_rejected_book(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[get_current_user] = override_approved_author

    delete_mock = AsyncMock(return_value=None)
    monkeypatch.setattr(
        book_router.book_service,
        "delete_book",
        delete_mock,
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.delete("/api/books/1")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Book deleted successfully"
        delete_mock.assert_awaited_once()

"""Tests Category update rules and endpoint authorization."""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import ANY, AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from database import get_db_session
from dependencies import require_admin
from main import app
from routers.category_router import category_service
from schemas.category import CategoryUpdate
from services.category_service import (
    CategoryConflictError,
    CategoryNotFoundError,
    CategoryService,
)


@pytest.mark.asyncio
async def test_update_normalizes_name_and_description():
    service = CategoryService()
    session = AsyncMock()
    category = SimpleNamespace(id=4, name="Fiction")
    updated = SimpleNamespace(id=4, name="History")

    service.category_repository.get_by_id = AsyncMock(
        return_value=category
    )
    service.category_repository.get_by_name = AsyncMock(return_value=None)
    service.category_repository.update = AsyncMock(return_value=updated)

    result = await service.update_category(
        session,
        4,
        CategoryUpdate(name="  History  ", description="   "),
    )

    assert result is updated
    service.category_repository.get_by_name.assert_awaited_once_with(
        session, "History", exclude_id=4
    )
    service.category_repository.update.assert_awaited_once_with(
        session,
        category,
        {"name": "History", "description": None},
    )
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_rejects_case_insensitive_duplicate():
    service = CategoryService()
    session = AsyncMock()
    category = SimpleNamespace(id=4, name="Fiction")

    service.category_repository.get_by_id = AsyncMock(
        return_value=category
    )
    service.category_repository.get_by_name = AsyncMock(
        return_value=SimpleNamespace(id=7, name="History")
    )

    with pytest.raises(CategoryConflictError):
        await service.update_category(
            session, 4, CategoryUpdate(name=" history ")
        )


@pytest.mark.asyncio
async def test_missing_category_raises_not_found():
    service = CategoryService()
    service.category_repository.get_by_id = AsyncMock(return_value=None)

    with pytest.raises(CategoryNotFoundError):
        await service.get_category_by_id(AsyncMock(), 999)


async def override_database_session():
    yield AsyncMock()


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_patch_requires_authentication():
    app.dependency_overrides[get_db_session] = override_database_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.patch(
            "/api/categories/4", json={"name": "History"}
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_can_patch_category(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    app.dependency_overrides[require_admin] = lambda: SimpleNamespace(id=1)
    now = datetime.now(UTC)
    updated = SimpleNamespace(
        id=4,
        name="History",
        description=None,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    update_mock = AsyncMock(return_value=updated)
    monkeypatch.setattr(category_service, "update_category", update_mock)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.patch(
            "/api/categories/4", json={"name": "History"}
        )

    assert response.status_code == 200
    assert response.json()["name"] == "History"


@pytest.mark.asyncio
async def test_category_list_uses_pagination(monkeypatch):
    app.dependency_overrides[get_db_session] = override_database_session
    now = datetime.now(UTC)
    item = SimpleNamespace(
        id=4,
        name="History",
        description=None,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    list_mock = AsyncMock(return_value=([item], 21))
    monkeypatch.setattr(category_service, "list_categories", list_mock)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/categories/?page=2&page_size=10"
        )

    assert response.status_code == 200
    assert response.json()["items"][0]["name"] == "History"
    assert response.json()["total"] == 21
    list_mock.assert_awaited_once_with(
        ANY, page=2, page_size=10
    )

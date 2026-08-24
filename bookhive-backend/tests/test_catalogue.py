"""Tests public catalogue filtering and pagination."""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from repositories.book_repository import BookRepository
from services.book_service import BookService


@pytest.mark.asyncio
async def test_catalogue_item_query_uses_complete_search_wildcards():
    repository = BookRepository()
    session = AsyncMock()
    scalars = MagicMock()
    scalars.all.return_value = []
    result = MagicMock()
    result.scalars.return_value = scalars
    session.execute.return_value = result

    await repository.get_published_books_with_filters(
        session,
        offset=0,
        limit=10,
        search_query=" Dune ",
        language=" English ",
    )

    statement = session.execute.await_args.args[0]
    values = list(statement.compile().params.values())
    assert "%Dune%" in values
    assert "english" in values


@pytest.mark.asyncio
async def test_catalogue_count_uses_the_same_filters():
    repository = BookRepository()
    session = AsyncMock()
    result = MagicMock()
    result.scalar_one.return_value = 3
    session.execute.return_value = result

    total = await repository.get_published_books_count(
        session,
        search_query="Dune",
        category_id=4,
        language="English",
    )

    statement = session.execute.await_args.args[0]
    values = list(statement.compile().params.values())
    assert total == 3
    assert "%Dune%" in values
    assert 4 in values
    assert "english" in values


@pytest.mark.asyncio
async def test_catalogue_service_maps_items_and_pagination():
    service = BookService()
    session = AsyncMock()
    book = SimpleNamespace(
        id=12,
        title="Dune",
        description="Science fiction",
        language="English",
        reading_level="Advanced",
        page_count=412,
        published_at=datetime.now(UTC),
        cover_image_path="storage/covers/dune.jpg",
        author=SimpleNamespace(full_name="Frank Herbert"),
        category=SimpleNamespace(name="Science Fiction"),
    )
    service.book_repository.get_published_books_count = AsyncMock(
        return_value=21
    )
    service.book_repository.get_published_books_with_filters = AsyncMock(
        return_value=[book]
    )

    result = await service.get_public_catalogue(
        session,
        page=2,
        page_size=10,
        search_query="Dune",
    )

    assert result.total_items == 21
    assert result.total_pages == 3
    assert result.current_page == 2
    assert result.items[0].cover_url == "/storage/covers/dune.jpg"
    service.book_repository.get_published_books_with_filters.assert_awaited_once_with(
        session=session,
        offset=10,
        limit=10,
        search_query="Dune",
        category_id=None,
        language=None,
    )

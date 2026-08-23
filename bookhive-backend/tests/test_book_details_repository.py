"""Tests the Book Details repository query."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from orm_models.book import BookStatus
from repositories.book_repository import BookRepository


@pytest.mark.asyncio
async def test_book_details_query_filters_published_books():
    repository = BookRepository()
    session = AsyncMock()

    published_book = SimpleNamespace(
        id=12,
        status=BookStatus.PUBLISHED,
    )

    database_result = MagicMock()
    database_result.scalar_one_or_none.return_value = (
        published_book
    )

    session.execute.return_value = database_result

    result = (
        await repository.get_published_book_details(
            session=session,
            book_id=12,
        )
    )

    assert result is published_book

    session.execute.assert_awaited_once()

    statement = session.execute.await_args.args[0]
    compiled_statement = statement.compile()

    parameter_values = list(
        compiled_statement.params.values()
    )

    assert 12 in parameter_values
    assert BookStatus.PUBLISHED in parameter_values

    database_result.scalar_one_or_none.assert_called_once()
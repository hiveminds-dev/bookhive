"""Tests public Review retrieval for Book Details."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from repositories.review_repository import ReviewRepository


@pytest.mark.asyncio
async def test_reviews_are_filtered_by_book_and_ordered():
    repository = ReviewRepository()
    session = AsyncMock()

    review = SimpleNamespace(
        id=21,
        book_id=12,
    )

    scalar_result = MagicMock()
    scalar_result.all.return_value = [review]

    database_result = MagicMock()
    database_result.scalars.return_value = scalar_result

    session.execute.return_value = database_result

    result = await repository.get_reviews_for_book(
        session=session,
        book_id=12,
    )

    assert result == [review]
    session.execute.assert_awaited_once()

    statement = session.execute.await_args.args[0]
    statement_text = str(statement).lower()
    parameter_values = list(
        statement.compile().params.values()
    )

    assert 12 in parameter_values
    assert "reviews.book_id" in statement_text
    assert "order by reviews.created_at desc" in statement_text

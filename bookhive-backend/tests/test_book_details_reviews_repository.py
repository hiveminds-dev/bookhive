"""Tests public Review retrieval for Book Details."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from repositories.review_repository import ReviewRepository


@pytest.mark.asyncio
async def test_visible_reviews_are_filtered_and_ordered():
    repository = ReviewRepository()
    session = AsyncMock()

    visible_review = SimpleNamespace(
        id=21,
        book_id=12,
        is_visible=True,
    )

    scalar_result = MagicMock()
    scalar_result.all.return_value = [visible_review]

    database_result = MagicMock()
    database_result.scalars.return_value = scalar_result

    session.execute.return_value = database_result

    result = await repository.get_visible_reviews_for_book(
        session=session,
        book_id=12,
    )

    assert result == [visible_review]
    session.execute.assert_awaited_once()

    statement = session.execute.await_args.args[0]
    statement_text = str(statement).lower()
    parameter_values = list(
        statement.compile().params.values()
    )

    assert 12 in parameter_values
    assert "reviews.is_visible is true" in statement_text
    assert "order by reviews.created_at desc" in statement_text

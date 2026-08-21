from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import ANY, AsyncMock

import pytest

from orm_models.book import BookStatus
from orm_models.user import AccountStatus
from services.author_service import AuthorService


@pytest.mark.asyncio
async def test_dashboard_uses_authenticated_author_and_returns_all_status_counts():
    service = AuthorService()
    service.book_repository.get_author_status_counts = AsyncMock(
        return_value={
            BookStatus.DRAFT: 2,
            BookStatus.PENDING_REVIEW: 1,
            BookStatus.PUBLISHED: 3,
            BookStatus.REJECTED: 1,
        }
    )
    updated_at = datetime.now(UTC)
    service.book_repository.get_recent_author_books = AsyncMock(
        return_value=[
            SimpleNamespace(
                id=12,
                title="A Test Book",
                status=BookStatus.PENDING_REVIEW,
                updated_at=updated_at,
            )
        ]
    )
    author = SimpleNamespace(
        id=7,
        full_name="Test Author",
        account_status=AccountStatus.APPROVED,
        author_profile=SimpleNamespace(pen_name="T. Author"),
    )

    result = await service.get_dashboard_data(AsyncMock(), author)

    assert result.author.id == 7
    assert result.author.pen_name == "T. Author"
    assert result.author.account_status == AccountStatus.APPROVED
    assert result.stats.total_books == 7
    assert result.stats.draft_books == 2
    assert result.stats.pending_review_books == 1
    assert result.stats.published_books == 3
    assert result.stats.rejected_books == 1
    assert result.recent_submissions[0].id == 12
    service.book_repository.get_author_status_counts.assert_awaited_once_with(
        ANY,
        7,
    )


@pytest.mark.asyncio
async def test_dashboard_defaults_missing_status_counts_to_zero():
    service = AuthorService()
    service.book_repository.get_author_status_counts = AsyncMock(return_value={})
    service.book_repository.get_recent_author_books = AsyncMock(return_value=[])
    author = SimpleNamespace(
        id=9,
        full_name="New Author",
        account_status=AccountStatus.APPROVED,
        author_profile=None,
    )

    result = await service.get_dashboard_data(AsyncMock(), author)

    assert result.stats.total_books == 0
    assert result.stats.draft_books == 0
    assert result.stats.pending_review_books == 0
    assert result.stats.published_books == 0
    assert result.stats.rejected_books == 0
    assert result.recent_submissions == []

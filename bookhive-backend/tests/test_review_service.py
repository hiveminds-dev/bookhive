"""Tests ReviewService logic and rules."""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from orm_models.book import BookStatus
from schemas.review import ReviewCreateRequest, ReviewUpdateRequest
from services.review_service import (
    ReviewConflictError,
    ReviewNotFoundError,
    ReviewPermissionError,
    ReviewService,
    ReviewValidationError,
)


def make_test_book(status: BookStatus = BookStatus.PUBLISHED):
    return SimpleNamespace(
        id=10,
        title="Logic and Form",
        status=status,
    )


def make_test_review(review_id: int = 1, book_id: int = 10, user_id: int = 5, rating: int = 5):
    return SimpleNamespace(
        id=review_id,
        book_id=book_id,
        user_id=user_id,
        rating=rating,
        comment="Great!",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        user=SimpleNamespace(id=user_id, username="reader_test"),
    )


@pytest.mark.asyncio
async def test_create_review_success():
    service = ReviewService()
    session = AsyncMock()
    book = make_test_book(BookStatus.PUBLISHED)
    created_rev = make_test_review(review_id=1, book_id=10, user_id=5, rating=5)

    service.book_repository.get_published_book_details = AsyncMock(return_value=book)
    service.review_repository.get_user_review_for_book = AsyncMock(return_value=None)
    service.review_repository.create_review = AsyncMock(return_value=created_rev)
    service.review_repository.get_review_by_id = AsyncMock(return_value=created_rev)

    res = await service.create_review(
        session=session,
        book_id=10,
        reader_id=5,
        review_data=ReviewCreateRequest(rating=5, comment="Great!"),
    )

    assert res.id == 1
    assert res.rating == 5
    assert res.reader_name == "reader_test"
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_create_review_rejected_for_non_published_book():
    service = ReviewService()
    session = AsyncMock()

    service.book_repository.get_published_book_details = AsyncMock(return_value=None)

    with pytest.raises(ReviewNotFoundError, match="Published book not found"):
        await service.create_review(
            session=session,
            book_id=10,
            reader_id=5,
            review_data=ReviewCreateRequest(rating=5),
        )


@pytest.mark.asyncio
async def test_create_review_rejected_if_already_reviewed():
    service = ReviewService()
    session = AsyncMock()
    book = make_test_book(BookStatus.PUBLISHED)
    existing_rev = make_test_review(review_id=1, book_id=10, user_id=5)

    service.book_repository.get_published_book_details = AsyncMock(return_value=book)
    service.review_repository.get_user_review_for_book = AsyncMock(return_value=existing_rev)

    with pytest.raises(ReviewConflictError, match="already submitted a review"):
        await service.create_review(
            session=session,
            book_id=10,
            reader_id=5,
            review_data=ReviewCreateRequest(rating=4),
        )


@pytest.mark.asyncio
async def test_create_review_validation():
    service = ReviewService()
    session = AsyncMock()
    book = make_test_book(BookStatus.PUBLISHED)

    service.book_repository.get_published_book_details = AsyncMock(return_value=book)
    service.review_repository.get_user_review_for_book = AsyncMock(return_value=None)

    req = ReviewCreateRequest.model_construct(rating=0)
    with pytest.raises(ReviewValidationError, match="Rating must be between 1 and 5"):
        await service.create_review(
            session=session,
            book_id=10,
            reader_id=5,
            review_data=req,
        )


@pytest.mark.asyncio
async def test_update_review_ownership_enforcement():
    service = ReviewService()
    session = AsyncMock()
    existing_rev = make_test_review(review_id=1, book_id=10, user_id=99)

    service.review_repository.get_review_by_id = AsyncMock(return_value=existing_rev)

    with pytest.raises(ReviewPermissionError, match="You can only edit your own review"):
        await service.update_review(
            session=session,
            review_id=1,
            reader_id=5,
            update_data=ReviewUpdateRequest(rating=3),
        )


@pytest.mark.asyncio
async def test_delete_review_ownership_enforcement():
    service = ReviewService()
    session = AsyncMock()
    existing_rev = make_test_review(review_id=1, book_id=10, user_id=99)

    service.review_repository.get_review_by_id = AsyncMock(return_value=existing_rev)

    with pytest.raises(ReviewPermissionError, match="You can only delete your own review"):
        await service.delete_review(
            session=session,
            review_id=1,
            reader_id=5,
        )


@pytest.mark.asyncio
async def test_delete_review_success():
    service = ReviewService()
    session = AsyncMock()
    existing_rev = make_test_review(review_id=1, book_id=10, user_id=5)

    service.review_repository.get_review_by_id = AsyncMock(return_value=existing_rev)
    service.review_repository.delete_review = AsyncMock()

    await service.delete_review(
        session=session,
        review_id=1,
        reader_id=5,
    )

    service.review_repository.delete_review.assert_awaited_once_with(
        session=session,
        review=existing_rev,
    )
    session.commit.assert_awaited_once()

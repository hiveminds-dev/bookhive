"""Tests the public Book Details service."""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from orm_models.book import BookStatus
from services.book_service import (
    BookNotFoundError,
    BookService,
)


def make_published_book():
    author_profile = SimpleNamespace(
        pen_name="E. V. Sterling",
        short_bio=(
            "Author of classical and dark "
            "philosophy literature."
        ),
        profile_image_path=(
            "storage/authors/sterling.jpg"
        ),
    )

    author = SimpleNamespace(
        id=7,
        full_name="Eleanor Vance",
        username="eleanorv",
        author_profile=author_profile,
    )

    category = SimpleNamespace(
        id=4,
        name="Philosophy",
    )

    return SimpleNamespace(
        id=12,
        title="Beyond Good and Evil",
        description=(
            "A prelude to a philosophy of the future."
        ),
        language="English",
        reading_level="Advanced",
        cover_image_path=(
            "storage/covers/book-cover.jpg"
        ),
        pdf_path="storage/books/book.pdf",
        page_count=250,
        estimated_reading_time="8 hours 20 mins",
        status=BookStatus.PUBLISHED,
        published_at=datetime.now(UTC),
        author=author,
        category=category,
    )


@pytest.mark.asyncio
async def test_published_book_details_are_mapped():
    service = BookService()
    book = make_published_book()

    service.book_repository.get_published_book_details = (
        AsyncMock(
            return_value=book,
        )
    )
    service.review_repository.get_reviews_for_book = (
        AsyncMock(
            return_value=[
                SimpleNamespace(
                    id=21,
                    user=SimpleNamespace(
                        username="reader_one",
                    ),
                    rating=5,
                    comment="Excellent book.",
                    created_at=datetime.now(UTC),
                ),
                SimpleNamespace(
                    id=22,
                    user=SimpleNamespace(
                        username="reader_two",
                    ),
                    rating=4,
                    comment="Very useful.",
                    created_at=datetime.now(UTC),
                ),
            ],
        )
    )

    result = await service.get_public_book_details(
        session=AsyncMock(),
        book_id=book.id,
    )

    assert result.id == book.id
    assert result.title == book.title
    assert result.status == BookStatus.PUBLISHED

    assert result.cover_url == (
        "/storage/covers/book-cover.jpg"
    )
    assert result.pdf_url == (
        "/storage/books/book.pdf"
    )

    assert result.can_read is True
    assert result.can_download is True
    assert result.page_count == 250
    assert result.estimated_reading_time == "8 hours 20 mins"
    assert result.average_rating == 4.5
    assert result.review_count == 2
    assert len(result.reviews) == 2
    assert result.reviews[0].reader_name == (
        "reader_one"
    )

    assert result.author.id == 7
    assert result.author.display_name == (
        "E. V. Sterling"
    )
    assert result.author.username == "eleanorv"
    assert result.author.profile_image_url == (
        "/storage/authors/sterling.jpg"
    )

    assert result.category.id == 4
    assert result.category.name == "Philosophy"

    (
        service.book_repository
        .get_published_book_details
        .assert_awaited_once()
    )


@pytest.mark.asyncio
async def test_author_full_name_is_used_without_profile():
    service = BookService()
    book = make_published_book()

    book.author.author_profile = None
    book.pdf_path = None
    book.cover_image_path = None

    service.book_repository.get_published_book_details = (
        AsyncMock(
            return_value=book,
        )
    )
    service.review_repository.get_reviews_for_book = (
        AsyncMock(return_value=[])
    )

    result = await service.get_public_book_details(
        session=AsyncMock(),
        book_id=book.id,
    )

    assert result.author.display_name == (
        "Eleanor Vance"
    )
    assert result.author.biography is None
    assert result.author.profile_image_url is None

    assert result.pdf_url is None
    assert result.cover_url is None
    assert result.can_read is False
    assert result.can_download is False
    assert result.average_rating == 0.0
    assert result.review_count == 0
    assert result.reviews == []


@pytest.mark.asyncio
async def test_unpublished_or_missing_book_returns_not_found():
    service = BookService()

    service.book_repository.get_published_book_details = (
        AsyncMock(
            return_value=None,
        )
    )

    with pytest.raises(
        BookNotFoundError,
        match="Published book not found",
    ):
        await service.get_public_book_details(
            session=AsyncMock(),
            book_id=999,
        )

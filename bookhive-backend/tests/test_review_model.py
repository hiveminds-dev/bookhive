"""Tests Review persistence and business constraints."""

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from database import Base
from orm_models.book import Book, BookStatus
from orm_models.category import Category
from orm_models.review import Review
from orm_models.user import User, UserRole


@pytest.fixture()
def review_data():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)

    with Session(engine) as session:
        author = User(
            full_name="Book Author",
            username="book_author",
            email="author@example.com",
            password_hash="hashed-password",
            email_verified=True,
            role=UserRole.AUTHOR,
        )
        reader = User(
            full_name="Book Reader",
            username="book_reader",
            email="reader@example.com",
            password_hash="hashed-password",
            email_verified=True,
            role=UserRole.READER,
        )
        category = Category(name="Technology")

        session.add_all([author, reader, category])
        session.flush()

        book = Book(
            title="Reviewed Book",
            author_id=author.id,
            category_id=category.id,
            status=BookStatus.PUBLISHED,
        )

        session.add(book)
        session.commit()

        yield session, book, reader

    Base.metadata.drop_all(engine)
    engine.dispose()


def test_review_defaults_and_relationships(review_data):
    session, book, reader = review_data

    review = Review(
        book_id=book.id,
        reader_id=reader.id,
        rating=5,
        comment="Excellent book.",
    )

    session.add(review)
    session.commit()
    session.refresh(review)

    assert review.is_visible is True
    assert review.helpful_count == 0
    assert review.book.id == book.id
    assert review.reader.id == reader.id


@pytest.mark.parametrize("rating", [0, 6])
def test_review_rating_must_be_between_one_and_five(
    review_data,
    rating,
):
    session, book, reader = review_data

    session.add(
        Review(
            book_id=book.id,
            reader_id=reader.id,
            rating=rating,
            comment="Invalid rating.",
        )
    )

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()


def test_reader_can_have_only_one_review_per_book(review_data):
    session, book, reader = review_data

    session.add_all(
        [
            Review(
                book_id=book.id,
                reader_id=reader.id,
                rating=4,
                comment="First review.",
            ),
            Review(
                book_id=book.id,
                reader_id=reader.id,
                rating=5,
                comment="Duplicate review.",
            ),
        ]
    )

    with pytest.raises(IntegrityError):
        session.commit()

    session.rollback()

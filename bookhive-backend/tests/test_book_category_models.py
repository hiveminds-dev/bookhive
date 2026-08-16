import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from database import Base
from orm_models.book import Book, BookStatus
from orm_models.category import Category
from orm_models.user import User, UserRole


@pytest.fixture()
def db_session():
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
        yield session

    Base.metadata.drop_all(engine)
    engine.dispose()


def create_author(db_session: Session) -> User:
    author = User(
        full_name="Test Author",
        username="test_author",
        email="author@example.com",
        password_hash="hashed-password",
        email_verified=True,
        role=UserRole.AUTHOR,
    )

    db_session.add(author)
    db_session.commit()
    db_session.refresh(author)

    return author


def create_category(db_session: Session) -> Category:
    category = Category(
        name="Fiction",
        description="Fiction books",
    )

    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)

    return category


def test_create_category(db_session: Session):
    category = create_category(db_session)

    assert category.id is not None
    assert category.name == "Fiction"
    assert category.is_active is True


def test_duplicate_category_name_rejected(db_session: Session):
    db_session.add(Category(name="Fantasy"))
    db_session.commit()

    db_session.add(Category(name="Fantasy"))

    with pytest.raises(IntegrityError):
        db_session.commit()

    db_session.rollback()


def test_create_book_with_author_and_category(db_session: Session):
    author = create_author(db_session)
    category = create_category(db_session)

    book = Book(
        title="Test Book",
        author_id=author.id,
        category_id=category.id,
    )

    db_session.add(book)
    db_session.commit()
    db_session.refresh(book)

    assert book.id is not None
    assert book.author_id == author.id
    assert book.category_id == category.id


def test_default_book_status_is_draft(db_session: Session):
    author = create_author(db_session)
    category = create_category(db_session)

    book = Book(
        title="Draft Book",
        author_id=author.id,
        category_id=category.id,
    )

    db_session.add(book)
    db_session.commit()
    db_session.refresh(book)

    assert book.status == BookStatus.DRAFT


def test_required_book_title(db_session: Session):
    author = create_author(db_session)
    category = create_category(db_session)

    book = Book(
        title=None,
        author_id=author.id,
        category_id=category.id,
    )

    db_session.add(book)

    with pytest.raises(IntegrityError):
        db_session.commit()

    db_session.rollback()


def test_book_relationships(db_session: Session):
    author = create_author(db_session)
    category = create_category(db_session)

    book = Book(
        title="Relationship Test",
        author_id=author.id,
        category_id=category.id,
    )

    db_session.add(book)
    db_session.commit()
    db_session.refresh(book)

    assert book.author.id == author.id
    assert book.category.id == category.id
    assert book in author.books
    assert book in category.books


def test_category_can_be_deactivated_without_deleting_books(
    db_session: Session,
):
    author = create_author(db_session)
    category = create_category(db_session)

    book = Book(
        title="Active Category Book",
        author_id=author.id,
        category_id=category.id,
    )

    db_session.add(book)
    db_session.commit()

    category.is_active = False
    db_session.commit()
    db_session.refresh(category)
    db_session.refresh(book)

    assert category.is_active is False
    assert book.id is not None
    assert book.category_id == category.id


def test_used_category_cannot_hard_delete_books(
    db_session: Session,
):
    author = create_author(db_session)
    category = create_category(db_session)

    book = Book(
        title="Protected Book",
        author_id=author.id,
        category_id=category.id,
    )

    db_session.add(book)
    db_session.commit()

    db_session.delete(category)

    with pytest.raises(IntegrityError):
        db_session.commit()

    db_session.rollback()

    saved_book = db_session.get(Book, book.id)

    assert saved_book is not None

"""Handles Book rules."""

import logging
import math
from datetime import UTC, datetime

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book, BookStatus
from repositories.book_repository import BookRepository
from repositories.review_repository import ReviewRepository
from schemas.book import (
    BookCreateRequest,
    CatalogueBookResponse,
    BookDetailsAuthorResponse,
    BookDetailsCategoryResponse,
    BookDetailsResponse,
    BookUpdateRequest,
    PaginatedCatalogueResponse,
)
from schemas.review import PublicReviewResponse
from utils.file_handler import (
    FileUploadError,
    delete_stored_file,
    save_cover,
    save_pdf,
)

logger = logging.getLogger(__name__)


class BookNotFoundError(ValueError):
    pass


class BookPermissionError(ValueError):
    pass


class BookValidationError(ValueError):
    pass


class BookService:
    def __init__(self) -> None:
        self.book_repository = BookRepository()
        self.review_repository = ReviewRepository()

    async def create_draft(
        self,
        session: AsyncSession,
        author_id: int,
        book_data: BookCreateRequest,
    ) -> Book:
        await self._validate_category(
            session,
            book_data.category_id,
        )

        try:
            book = await self.book_repository.create_book(
                session=session,
                author_id=author_id,
                book_data=book_data.model_dump(),
            )

            await session.commit()
            await session.refresh(book)
            return book

        except Exception:
            await session.rollback()
            raise

    async def list_author_books(
        self,
        session: AsyncSession,
        author_id: int,
        book_status: BookStatus | None,
        offset: int,
        limit: int,
    ) -> list[Book]:
        return await self.book_repository.get_author_books(
            session,
            author_id,
            book_status,
            offset,
            limit,
        )

    async def get_public_catalogue(
        self,
        session: AsyncSession,
        *,
        page: int,
        page_size: int,
        search_query: str | None = None,
        category_id: int | None = None,
        language: str | None = None,
    ) -> PaginatedCatalogueResponse:
        filters = {
            "search_query": search_query,
            "category_id": category_id,
            "language": language,
        }
        total_items = await self.book_repository.get_published_books_count(
            session=session, **filters
        )
        books = await self.book_repository.get_published_books_with_filters(
            session=session,
            offset=(page - 1) * page_size,
            limit=page_size,
            **filters,
        )
        return PaginatedCatalogueResponse(
            total_items=total_items,
            total_pages=math.ceil(total_items / page_size),
            current_page=page,
            page_size=page_size,
            items=[
                CatalogueBookResponse(
                    id=book.id,
                    title=book.title,
                    description=book.description,
                    language=book.language,
                    reading_level=book.reading_level,
                    published_at=book.published_at,
                    cover_url=self._to_public_storage_url(
                        book.cover_image_path
                    ),
                    author_name=book.author.full_name,
                    category_name=book.category.name,
                )
                for book in books
            ],
        )

    async def get_public_book_details(
        self,
        session: AsyncSession,
        book_id: int,
    ) -> BookDetailsResponse:
        """Return details for a published book."""

        book = (
            await self.book_repository.get_published_book_details(
                session,
                book_id,
            )
        )

        if book is None:
            raise BookNotFoundError(
                "Published book not found"
            )

        author_profile = book.author.author_profile

        display_name = book.author.full_name
        biography = None
        profile_image_url = None

        if author_profile is not None:
            if author_profile.pen_name.strip():
                display_name = author_profile.pen_name.strip()

            biography = author_profile.short_bio
            profile_image_url = (
                self._to_public_storage_url(
                    author_profile.profile_image_path
                )
            )

        pdf_url = self._to_public_storage_url(
            book.pdf_path
        )

        cover_url = self._to_public_storage_url(
            book.cover_image_path
        )

        has_pdf = pdf_url is not None

        reviews = (
            await self.review_repository.get_reviews_for_book(
                session=session,
                book_id=book.id,
            )
        )

        review_count = len(reviews)
        average_rating = (
            round(
                sum(review.rating for review in reviews)
                / review_count,
                1,
            )
            if review_count
            else 0.0
        )

        return BookDetailsResponse(
            id=book.id,
            title=book.title,
            description=book.description,
            language=book.language,
            reading_level=book.reading_level,
            cover_url=cover_url,
            pdf_url=pdf_url,
            status=book.status,
            published_at=book.published_at,
            can_read=has_pdf,
            can_download=has_pdf,
            average_rating=average_rating,
            review_count=review_count,
            reviews=[
                PublicReviewResponse(
                    id=review.id,
                    reader_name=review.user.username,
                    rating=review.rating,
                    comment=review.comment,
                    created_at=review.created_at,
                )
                for review in reviews
            ],
            author=BookDetailsAuthorResponse(
                id=book.author.id,
                display_name=display_name,
                username=book.author.username,
                biography=biography,
                profile_image_url=profile_image_url,
            ),
            category=BookDetailsCategoryResponse(
                id=book.category.id,
                name=book.category.name,
            ),
        )

    async def update_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
        book_data: BookUpdateRequest,
    ) -> Book:
        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        updates = book_data.model_dump(
            exclude_unset=True
        )
        category_id = updates.get("category_id")

        if category_id is not None:
            await self._validate_category(
                session,
                category_id,
            )

        try:
            updated_book = (
                await self.book_repository.update_book(
                    session,
                    book,
                    updates,
                )
            )

            await session.commit()
            await session.refresh(updated_book)
            return updated_book

        except Exception:
            await session.rollback()
            raise

    async def upload_pdf(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
        upload: UploadFile,
    ) -> Book:
        """Validate and attach a PDF to an author's book."""

        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        new_pdf_path = await save_pdf(upload)
        old_pdf_path = book.pdf_path

        return await self._save_uploaded_path(
            session=session,
            book=book,
            field_name="pdf_path",
            new_path=new_pdf_path,
            old_path=old_pdf_path,
        )

    async def upload_cover(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
        upload: UploadFile,
    ) -> Book:
        """Validate and attach a cover image to an author's book."""

        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        new_cover_path = await save_cover(upload)
        old_cover_path = book.cover_image_path

        return await self._save_uploaded_path(
            session=session,
            book=book,
            field_name="cover_image_path",
            new_path=new_cover_path,
            old_path=old_cover_path,
        )

    async def submit_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        book = await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

        self._ensure_book_is_editable(book)

        missing_fields = [
            field
            for field, value in {
                "title": book.title,
                "description": book.description,
                "language": book.language,
                "pdf_path": book.pdf_path,
                "cover_image_path": (
                    book.cover_image_path
                ),
            }.items()
            if value is None
            or (
                isinstance(value, str)
                and not value.strip()
            )
        ]

        if missing_fields:
            raise BookValidationError(
                "Book submission is incomplete. Missing: "
                + ", ".join(missing_fields)
            )

        try:
            updated_book = (
                await self.book_repository.update_book_status(
                    session=session,
                    book=book,
                    new_status=(
                        BookStatus.PENDING_REVIEW
                    ),
                    submitted_at=datetime.now(UTC),
                )
            )

            await session.commit()
            await session.refresh(updated_book)
            return updated_book

        except Exception:
            await session.rollback()
            raise

    async def get_book_status(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        return await self._get_owned_book(
            session,
            author_id,
            book_id,
        )

    async def _save_uploaded_path(
        self,
        *,
        session: AsyncSession,
        book: Book,
        field_name: str,
        new_path: str,
        old_path: str | None,
    ) -> Book:
        """Save an uploaded path and clean up replaced files."""

        try:
            updated_book = (
                await self.book_repository.update_book(
                    session,
                    book,
                    {
                        field_name: new_path,
                    },
                )
            )

            await session.commit()
            await session.refresh(updated_book)

        except Exception:
            await session.rollback()
            await self._delete_upload_quietly(
                new_path
            )
            raise

        if old_path and old_path != new_path:
            await self._delete_upload_quietly(
                old_path
            )

        return updated_book

    async def _delete_upload_quietly(
        self,
        path: str | None,
    ) -> None:
        """Delete an upload without failing a database update."""

        try:
            await delete_stored_file(path)

        except (FileUploadError, OSError) as exc:
            logger.warning(
                "Could not delete uploaded file %s: %s",
                path,
                exc,
            )

    async def _get_owned_book(
        self,
        session: AsyncSession,
        author_id: int,
        book_id: int,
    ) -> Book:
        book = await self.book_repository.get_book_by_id(
            session,
            book_id,
        )

        if book is None:
            raise BookNotFoundError(
                "Book not found"
            )

        if book.author_id != author_id:
            raise BookPermissionError(
                "You do not have permission to access this book"
            )

        return book

    async def _validate_category(
        self,
        session: AsyncSession,
        category_id: int,
    ) -> None:
        category = (
            await self.book_repository.get_active_category(
                session,
                category_id,
            )
        )

        if category is None:
            raise BookValidationError(
                "Category does not exist or is inactive"
            )

    @staticmethod
    def _to_public_storage_url(
        stored_path: str | None,
    ) -> str | None:
        """Convert a stored relative path into a public URL."""

        if stored_path is None:
            return None

        normalized_path = (
            stored_path
            .strip()
            .replace("\\", "/")
            .lstrip("/")
        )

        if not normalized_path:
            return None

        if normalized_path.startswith(
            ("http://", "https://")
        ):
            return normalized_path

        if not normalized_path.startswith(
            "storage/"
        ):
            return None

        return f"/{normalized_path}"

    @staticmethod
    def _ensure_book_is_editable(
        book: Book,
    ) -> None:
        if book.status not in {
            BookStatus.DRAFT,
            BookStatus.REJECTED,
        }:
            raise BookValidationError(
                "Only DRAFT or REJECTED books can be edited"
            )

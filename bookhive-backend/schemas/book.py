"""Validates Book API data."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from orm_models.book import BookStatus
from schemas.review import PublicReviewResponse


class BookCreateRequest(BaseModel):
    category_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(
        default=None,
        max_length=2000,
    )
    language: str | None = Field(
        default=None,
        max_length=50,
    )
    reading_level: str | None = Field(
        default=None,
        max_length=50,
    )


class BookUpdateRequest(BaseModel):
    category_id: int | None = Field(
        default=None,
        gt=0,
    )
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    description: str | None = Field(
        default=None,
        max_length=2000,
    )
    language: str | None = Field(
        default=None,
        max_length=50,
    )
    reading_level: str | None = Field(
        default=None,
        max_length=50,
    )

    @model_validator(mode="after")
    def require_an_update(self) -> BookUpdateRequest:
        if not self.model_fields_set:
            raise ValueError(
                "At least one book field must be supplied"
            )

        return self


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    category_id: int
    title: str
    description: str | None = None
    language: str | None = None
    reading_level: str | None = None
    pdf_path: str | None = None
    cover_image_path: str | None = None
    status: BookStatus
    created_at: datetime
    updated_at: datetime
    submitted_at: datetime | None = None
    published_at: datetime | None = None
    page_count: int | None = None
    category_name: str | None = None
    rejection_reason: str | None = None
    cover_url: str | None = None
    pdf_url: str | None = None


class BookStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: BookStatus
    submitted_at: datetime | None = None
    published_at: datetime | None = None
    rejection_reason: str | None = None


class BookDetailsAuthorResponse(BaseModel):
    id: int
    display_name: str
    username: str
    biography: str | None = None
    profile_image_url: str | None = None


class BookDetailsCategoryResponse(BaseModel):
    id: int
    name: str


class BookDetailsResponse(BaseModel):
    id: int
    title: str
    description: str | None
    language: str | None
    reading_level: str | None
    cover_url: str | None
    pdf_url: str | None
    status: BookStatus
    published_at: datetime | None
    page_count: int | None = None
    estimated_reading_time: str | None = None
    can_read: bool
    can_download: bool
    average_rating: float = Field(ge=0, le=5)
    review_count: int = Field(ge=0)
    reviews: list[PublicReviewResponse]
    author: BookDetailsAuthorResponse
    category: BookDetailsCategoryResponse


class BookResultResponse(BaseModel):
    message: str
    data: BookResponse


class BookStatusResultResponse(BaseModel):
    message: str
    data: BookStatusResponse


class BookListResultResponse(BaseModel):
    message: str
    data: list[BookResponse]


class BookDetailsResultResponse(BaseModel):
    message: str
    data: BookDetailsResponse


class CatalogueBookResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    language: str | None = None
    reading_level: str | None = None
    page_count: int | None = None
    published_at: datetime | None = None
    cover_url: str | None = None
    author_name: str
    category_name: str


class PaginatedCatalogueResponse(BaseModel):
    total_items: int = Field(ge=0)
    total_pages: int = Field(ge=0)
    current_page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    items: list[CatalogueBookResponse]

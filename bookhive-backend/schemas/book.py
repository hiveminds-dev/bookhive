"""Validates Book API data."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from orm_models.book import BookStatus


class BookCreateRequest(BaseModel):
    category_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    language: str | None = Field(default=None, max_length=50)
    reading_level: str | None = Field(default=None, max_length=50)
    pdf_path: str | None = Field(default=None, max_length=500)
    cover_image_path: str | None = Field(default=None, max_length=500)


class BookUpdateRequest(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    language: str | None = Field(default=None, max_length=50)
    reading_level: str | None = Field(default=None, max_length=50)
    pdf_path: str | None = Field(default=None, max_length=500)
    cover_image_path: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def require_an_update(self) -> "BookUpdateRequest":
        if not self.model_fields_set:
            raise ValueError("At least one book field must be supplied")
        return self


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    category_id: int
    title: str
    description: str | None
    language: str | None
    reading_level: str | None
    pdf_path: str | None
    cover_image_path: str | None
    status: BookStatus
    created_at: datetime
    updated_at: datetime
    submitted_at: datetime | None
    published_at: datetime | None


class BookStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: BookStatus
    submitted_at: datetime | None = None
    published_at: datetime | None = None


class BookResultResponse(BaseModel):
    message: str
    data: BookResponse


class BookStatusResultResponse(BaseModel):
    message: str
    data: BookStatusResponse


class BookListResultResponse(BaseModel):
    message: str
    data: list[BookResponse]

"""Checks rating and review data."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5")
    comment: str | None = Field(
        default=None,
        max_length=2000,
        description="Optional review comment text up to 2000 characters",
    )


class ReviewUpdateRequest(BaseModel):
    rating: int | None = Field(
        default=None,
        ge=1,
        le=5,
        description="Rating from 1 to 5",
    )
    comment: str | None = Field(
        default=None,
        max_length=2000,
        description="Optional review comment text up to 2000 characters",
    )

    @model_validator(mode="after")
    def require_an_update(self) -> "ReviewUpdateRequest":
        if not self.model_fields_set:
            raise ValueError("At least one review field must be supplied")
        return self


class PublicReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    book_id: int | None = None
    user_id: int | None = None
    reader_name: str
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class ReviewResultResponse(BaseModel):
    message: str
    data: PublicReviewResponse


class ReviewListResultResponse(BaseModel):
    message: str
    data: list[PublicReviewResponse]

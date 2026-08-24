"""Checks rating and review data."""

from datetime import datetime

from pydantic import BaseModel, Field


class PublicReviewResponse(BaseModel):
    id: int
    reader_name: str
    rating: int = Field(ge=1, le=5)
    comment: str | None
    created_at: datetime

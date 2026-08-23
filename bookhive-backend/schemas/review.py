"""Checks rating and review data."""

from datetime import datetime

from pydantic import BaseModel, Field


class PublicReviewResponse(BaseModel):
    id: int
    reader_name: str
    rating: int = Field(ge=1, le=5)
    comment: str
    helpful_count: int = Field(ge=0)
    created_at: datetime

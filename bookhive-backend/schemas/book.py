"""Checks Book data."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BookCreateRequest(BaseModel):
    category_id: int
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    language: Optional[str] = Field(None, max_length=50)
    reading_level: Optional[str] = Field(None, max_length=50)

class BookResponse(BaseModel):
    id: int
    author_id: int
    category_id: int
    title: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class BookStatusResponse(BaseModel):
    id: int
    title: str
    status: str
    submitted_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attribute = True

class BookResultResponse(BaseModel):
    message: str
    data: BookResponse

class BookStatusResultResponse(BaseModel):
    message: str
    data: BookStatusResponse

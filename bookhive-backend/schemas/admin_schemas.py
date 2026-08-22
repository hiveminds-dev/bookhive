from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class DashboardStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_books: int
    total_readers: int
    total_authors: int
    book_requests: int
    author_requests: int


class BookAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author_name: str
    category_name: str
    language: str | None
    reading_level: str | None
    status: str
    cover_image_path: str | None
    created_at: datetime
    published_at: datetime | None


class AuthorApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    pen_name: str
    email: EmailStr
    country: str | None
    account_status: str
    applied_date: datetime


class SystemLogResponse(BaseModel):
    timestamp: str
    level: str
    module: str
    message: str

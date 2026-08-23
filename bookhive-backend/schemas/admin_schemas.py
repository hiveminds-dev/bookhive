from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class DashboardStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_books: int
    total_readers: int
    total_authors: int
    total_admins: int = 0
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
    pdf_path: str | None = None
    page_count: int | None = None
    estimated_reading_time: str | None = None
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


class ReaderAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: EmailStr
    account_status: str
    joined_at: datetime


class RecentBookItem(BaseModel):
    id: int
    title: str
    author_name: str
    category_name: str
    status: str
    cover_image_path: str | None
    created_at: datetime


class RecentReaderItem(BaseModel):
    id: int
    full_name: str
    username: str
    joined_at: datetime


class RecentAuthorRequestItem(BaseModel):
    id: int
    user_id: int
    full_name: str
    pen_name: str
    country: str | None
    created_at: datetime | None = None



class DashboardRecentResponse(BaseModel):
    recent_books: list[RecentBookItem]
    recent_readers: list[RecentReaderItem]
    pending_author_requests: list[RecentAuthorRequestItem]


class SystemLogResponse(BaseModel):
    timestamp: str
    level: str
    module: str
    message: str


class BookStatusUpdateRequest(BaseModel):
    status: str


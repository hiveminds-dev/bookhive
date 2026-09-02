from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class DashboardStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_books: int
    total_readers: int
    total_authors: int
    total_admins: int = 0
    book_requests: int
    author_requests: int


class CategoryCreateRequest(BaseModel):
    name: str
    description: str | None = None


class CategoryAdminItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    is_active: bool
    total_books: int = 0
    created_at: datetime


class BookReviewItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_name: str
    avatar_letter: str
    rating: int
    comment: str | None
    created_at: str


class BookRejectionLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reason: str
    created_at: str


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
    author_profile_image_path: str | None = None
    page_count: int | None = None
    rejection_reason: str | None = None
    estimated_reading_time: str | None = None
    average_rating: float | None = 4.8
    review_count: int | None = 0
    reviews: list[BookReviewItem] = []
    rejection_logs: list[BookRejectionLogItem] = []
    created_at: datetime
    published_at: datetime | None


class PaginatedBookAdminResponse(BaseModel):
    items: list[BookAdminResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


class AuthorStatsResponse(BaseModel):
    new_applications: int
    total_authors: int
    books_in_review: int
    total_rejected: int


class MonthlyUploadItem(BaseModel):
    month: str
    dark: int
    light: int


class MonthlyRegistrationItem(BaseModel):
    month: str
    val: int


class TopCategoryStatItem(BaseModel):
    name: str
    pct: float


class MostReadBookItem(BaseModel):
    id: int
    title: str
    author: str
    category: str
    totalReads: str
    rating: str
    trend: str
    cover: str | None = None


class ActiveAuthorItem(BaseModel):
    name: str
    booksCount: int
    score: str
    avatar: str | None = None


class ActiveReaderItem(BaseModel):
    name: str
    joined: str
    totalReads: int
    initials: str


class PlatformStatisticsResponse(BaseModel):
    total_books: int
    total_readers: int
    total_authors: int
    total_downloads: str
    total_views: str
    monthly_uploads: list[MonthlyUploadItem]
    monthly_registrations: list[MonthlyRegistrationItem]
    top_categories: list[TopCategoryStatItem]
    most_read_books: list[MostReadBookItem]
    active_authors: list[ActiveAuthorItem]
    active_readers: list[ActiveReaderItem]


class AdminStaffStatsResponse(BaseModel):
    total_admin_accounts: int
    super_admins: int
    two_fa_protected_count: int
    two_fa_total: int
    pending_invites: int


class AdminUserItemResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    role_badge_class: str
    department: str
    last_active: str
    two_factor: bool
    status: str
    avatar: str


class AdminCreateRequest(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    role: str
    department: str


class AuthorRejectionRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=1, max_length=500)

    @field_validator("rejection_reason")
    @classmethod
    def validate_rejection_reason(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Rejection reason cannot be blank or whitespace only.")
        if len(stripped) > 500:
            raise ValueError("Rejection reason cannot exceed 500 characters.")
        return stripped


class AuthorRejectionLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reason: str
    created_at: str


class AuthorApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    pen_name: str
    email: EmailStr
    country: str | None
    account_status: str
    profile_image_path: str | None = None
    bio: str | None = None
    applied_date: datetime
    rejection_reason: str | None = None
    rejection_logs: list[AuthorRejectionLogItem] = []


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
    rejection_reason: str | None = None


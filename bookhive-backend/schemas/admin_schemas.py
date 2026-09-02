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
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Category name cannot be blank.")
        return stripped


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
    view_count: int = 0
    download_count: int = 0
    isbn: str | None = None
    average_rating: float | None = 0.0
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


class ReaderReviewAdminItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    book_id: int
    book_title: str
    book_cover_url: str | None = None
    book_author: str
    rating: int
    comment: str | None = None
    created_at: str


class ReaderDetailAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: EmailStr
    account_status: str
    email_verified: bool
    joined_at: datetime
    country: str | None = None
    short_bio: str | None = None
    review_count: int = 0
    reviews: list[ReaderReviewAdminItem] = []


class AuthorBookAdminSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category_name: str
    status: str
    cover_image_path: str | None = None
    view_count: int = 0
    download_count: int = 0
    average_rating: float = 0.0
    rejection_reason: str | None = None
    created_at: datetime
    published_at: datetime | None = None


class AuthorDetailAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: EmailStr
    account_status: str
    email_verified: bool
    created_at: datetime
    pen_name: str
    country: str | None = None
    short_bio: str | None = None
    profile_image_path: str | None = None
    total_books: int = 0
    total_views: int = 0
    total_downloads: int = 0
    average_rating: float = 0.0
    published_books: list[AuthorBookAdminSummary] = []
    pending_books: list[AuthorBookAdminSummary] = []
    rejected_books: list[AuthorBookAdminSummary] = []
    draft_books: list[AuthorBookAdminSummary] = []
    rejection_logs: list[AuthorRejectionLogItem] = []


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

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        stripped = value.strip().upper()
        if not stripped:
            raise ValueError("Status cannot be empty.")
        return stripped


class AccountStatusUpdateRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_account_status(cls, value: str) -> str:
        stripped = value.strip().lower()
        if not stripped:
            raise ValueError("Account status cannot be empty.")
        return stripped


class RequestChangesRequest(BaseModel):
    feedback: str

    @field_validator("feedback")
    @classmethod
    def validate_feedback(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Feedback cannot be empty.")
        if len(stripped) > 500:
            raise ValueError("Feedback cannot exceed 500 characters.")
        return stripped


class AdminActionSuccessResponse(BaseModel):
    success: bool = True
    message: str

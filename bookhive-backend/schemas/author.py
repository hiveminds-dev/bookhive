from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from orm_models.user import AccountStatus, UserRole


class AuthorRegistrationRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    pen_name: str = Field(min_length=2, max_length=100)
    username: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z][A-Za-z0-9_]*$",
    )
    country: str = Field(min_length=2, max_length=100)
    preferred_language: str = Field(min_length=2, max_length=50)
    short_bio: str = Field(min_length=10, max_length=500)


class AuthorRegistrationResponse(BaseModel):
    id: int
    author_profile_id: int
    full_name: str
    username: str
    email: EmailStr
    role: UserRole
    account_status: AccountStatus
    email_verified: bool
    pen_name: str
    country: str
    preferred_language: str
    short_bio: str
    profile_image_path: str | None
    created_at: datetime


class AuthorRegistrationResult(BaseModel):
    message: str
    data: AuthorRegistrationResponse

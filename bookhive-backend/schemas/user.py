from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from orm_models.user import AccountStatus, UserRole


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    username: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z][A-Za-z0-9_]*$",
    )
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: EmailStr
    role: UserRole
    account_status: AccountStatus
    email_verified: bool
    created_at: datetime


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: EmailStr
    role: UserRole
    account_status: AccountStatus
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    country: str | None = None
    preferred_language: str | None = None
    short_bio: str | None = None
    profile_image_path: str | None = None
    profile_image_url: str | None = None


class UserProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    full_name: str | None = Field(None, min_length=2, max_length=100)
    username: str | None = Field(
        None,
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z][A-Za-z0-9_]*$",
    )
    country: str | None = Field(None, max_length=100)
    preferred_language: str | None = Field(None, max_length=50)
    short_bio: str | None = Field(None, max_length=500)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        if len(stripped) < 2:
            raise ValueError("Full name must be at least 2 characters long")
        return stripped

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip().lower()
        if len(stripped) < 3:
            raise ValueError("Username must be at least 3 characters long")
        return stripped

    @field_validator("country", "preferred_language", "short_bio")
    @classmethod
    def sanitize_optional_strings(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped if stripped else None


class ProfileImageUploadResponse(BaseModel):
    message: str
    profile_image_path: str
    profile_image_url: str

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AuthorRegistrationRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    pen_name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_]+$")
    country: str | None = Field(default=None, max_length=100)
    preferred_language: str | None = Field(default=None, max_length=50)
    short_bio: str | None = Field(default=None, max_length=500)


class AuthorRegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    pen_name: str
    username: str
    country: str | None
    preferred_language: str | None
    short_bio: str | None
    profile_image_path: str | None


class AuthorRegistrationResult(BaseModel):
    message: str
    data: AuthorRegistrationResponse
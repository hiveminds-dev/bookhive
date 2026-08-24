from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuthorProfileBase(BaseModel):
    pen_name: str = Field(min_length=1, max_length=100)
    country: str | None = Field(None, max_length=100)
    preferred_language: str | None = Field(None, max_length=50)
    short_bio: str | None = Field(None, max_length=500)
    profile_image_path: str | None = Field(None, max_length=255)

    @field_validator("pen_name")
    @classmethod
    def normalize_pen_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Pen name cannot be blank")
        return normalized

class AuthorProfileCreate(AuthorProfileBase):
    pass


class AuthorProfileUpdate(BaseModel):
    pen_name: str | None = Field(None, min_length=1, max_length=100)
    country: str | None = Field(None, max_length=100)
    preferred_language: str | None = Field(None, max_length=50)
    short_bio: str | None = Field(None, max_length=500)
    profile_image_path: str | None = Field(None, max_length=255)

    @field_validator("pen_name")
    @classmethod
    def normalize_pen_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Pen name cannot be blank")
        return normalized


class AuthorProfileResponse(AuthorProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int

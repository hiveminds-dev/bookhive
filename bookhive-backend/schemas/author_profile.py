from typing import Optional

from pydantic import BaseModel, Field


class AuthorProfileBase(BaseModel):
    pen_name: str = Field(..., max_length=100, description="Author's pen name")
    country: Optional[str] = Field(None, max_length=100)
    preferred_language: Optional[str] = Field(None, max_length=50)
    short_bio: Optional[str] = Field(None, max_length=500)
    profile_image_path: Optional[str] = Field(None, max_length=255)

class AuthorProfileCreate(AuthorProfileBase):
    pass

class AuthorProfileUpdate(BaseModel):
    pen_name: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    preferred_language: Optional[str] = Field(None, max_length=50)
    short_bio: Optional[str] = Field(None, max_length=500)
    profile_image_path: Optional[str] = Field(None, max_length=255)

class AuthorProfileResponse(AuthorProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
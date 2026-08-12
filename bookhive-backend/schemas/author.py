"""Checks Author data."""

from pydantic import BaseModel


class AuthorCreate(BaseModel):
    user_id: int
    pen_name: str
    username: str
    country: str | None = None
    preferred_language: str | None = None
    short_bio: str | None = None
    profile_image_path: str | None = None





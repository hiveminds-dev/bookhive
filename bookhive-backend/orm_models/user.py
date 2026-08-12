"""Defines the User database table."""
import enum
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class UserRole(enum.StrEnum):
    READER = "reader"
    AUTHOR = "author"
    ADMIN = "admin"

class AccountStatus(enum.StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(30), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), default=UserRole.READER, nullable=False)
    account_status: Mapped[AccountStatus] = mapped_column(
        SQLEnum(AccountStatus), default=AccountStatus.INACTIVE, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    author_profile: Mapped[AuthorProfile | None] = relationship(
        "AuthorProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
        uselist=False
    )

class AuthorProfile(Base):
    __tablename__ = "author_profiles"

    id: Mapped[int] = mapped_column(Integer,primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),unique=True,nullable=False)
    pen_name: Mapped[str] = mapped_column(String(100),nullable=False)
    username: Mapped[str] = mapped_column(
        String(50),unique=True,nullable=False,index=True)
    country: Mapped[str | None] = mapped_column(String(100))
    preferred_language: Mapped[str | None] = mapped_column(String(50))
    short_bio: Mapped[str | None] = mapped_column(String(500))
    profile_image_path: Mapped[str | None] = mapped_column(String(255))

    user: Mapped[User] = relationship(
        "User",
        back_populates="author_profile",
        lazy="joined"
    )


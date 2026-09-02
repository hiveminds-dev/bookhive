from functools import lru_cache
from pathlib import Path
from typing import Self
from urllib.parse import quote_plus

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent

INSECURE_SECRET_KEYS: set[str] = {
    "change_me",
    "changeme",
    "secret",
    "password",
    "your-secret-key",
    "replace_with_a_secure_random_secret",
}


class Settings(BaseSettings):
    app_name: str = "BookHive"
    app_version: str = "1.0.0"
    app_env: str = "development"
    api_prefix: str = "/api"
    frontend_url: str = "http://localhost:4200"
    secret_key: str = "replace_with_a_secure_random_secret"
    access_token_expire_minutes: int = 30
    jwt_algorithm: str = "HS256"

    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "bookhive"
    database_user: str = "bookhive_user"
    database_password: str = "change_me"

    # Database startup behaviour
    reset_database_on_startup: bool = False
    seed_database_on_startup: bool = True
    seed_demo_data: bool = False

    # Initial administrator
    initial_admin_full_name: str = "BookHive Administrator"
    initial_admin_username: str = "bookhive_admin"
    initial_admin_email: str = "admin@bookhive.com"
    initial_admin_password: str = "change_me"

    # Initial super administrator
    initial_super_admin_full_name: str = "BookHive Super Administrator"
    initial_super_admin_username: str = "bookhive_super_admin"
    initial_super_admin_email: str = "superadmin@bookhive.com"
    initial_super_admin_password: str = "change_me"

    # Email verification
    email_verification_token_expire_minutes: int = 60
    email_verification_resend_cooldown_seconds: int = 60
    password_reset_token_expire_minutes: int = 30

    # Email delivery
    smtp_enabled: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@bookhive.local"
    smtp_use_tls: bool = True

    # Storage paths (resolved relative to backend directory)
    storage_root: Path = BACKEND_DIR / "storage"
    book_storage_path: Path = BACKEND_DIR / "storage" / "books"
    cover_storage_path: Path = BACKEND_DIR / "storage" / "covers"
    profile_image_storage_path: Path = BACKEND_DIR / "storage" / "profiles"
    max_book_size_mb: int = 50
    max_cover_size_mb: int = 5
    max_profile_image_size_mb: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        hide_input_in_errors=True,
    )

    @field_validator("secret_key", mode="before")
    @classmethod
    def validate_secret_key(cls, value: str | None) -> str:
        if value is None:
            raise ValueError(
                "SECRET_KEY must not be empty. "
                "Generate a secure secret using: openssl rand -hex 32"
            )

        cleaned = value.strip() if isinstance(value, str) else str(value).strip()

        if not cleaned:
            raise ValueError(
                "SECRET_KEY must not be empty. "
                "Generate a secure secret using: openssl rand -hex 32"
            )

        if cleaned.lower() in INSECURE_SECRET_KEYS:
            raise ValueError(
                "SECRET_KEY must not use an insecure placeholder value. "
                "Generate a secure secret using: openssl rand -hex 32"
            )

        if len(cleaned) < 32:
            raise ValueError(
                "SECRET_KEY must contain at least 32 characters. "
                "Generate a secure secret using: openssl rand -hex 32"
            )

        return cleaned

    @model_validator(mode="after")
    def resolve_storage_paths(self) -> Self:
        if not self.storage_root.is_absolute():
            self.storage_root = (BACKEND_DIR / self.storage_root).resolve()
        if not self.book_storage_path.is_absolute():
            self.book_storage_path = (BACKEND_DIR / self.book_storage_path).resolve()
        if not self.cover_storage_path.is_absolute():
            self.cover_storage_path = (BACKEND_DIR / self.cover_storage_path).resolve()
        if not self.profile_image_storage_path.is_absolute():
            self.profile_image_storage_path = (BACKEND_DIR / self.profile_image_storage_path).resolve()
        return self

    @property
    def database_url(self) -> str:
        password = quote_plus(self.database_password)

        return (
            f"postgresql+asyncpg://{self.database_user}:{password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )

    @property
    def is_database_reset_allowed(self) -> bool:
        return self.app_env.lower() in {"development", "test"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
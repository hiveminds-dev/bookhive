from functools import lru_cache
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "BookHive"
    app_version: str = "1.0.0"
    app_env: str = "development"
    api_prefix: str = "/api"
    frontend_url: str = "http://localhost:4200"
    secret_key: str = "change_me"
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

    # Email verification
    email_verification_token_expire_minutes: int = 60
    smtp_enabled: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@bookhive.local"
    smtp_use_tls: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

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

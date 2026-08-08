from functools import lru_cache
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    app_name: str = "BookHive"
    app_version: str = "1.0.0"
    app_env: str = "development"
    api_prefix: str = "/api"
    frontend_url: str = "http://localhost:4200"
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "bookhive"
    database_user: str = "bookhive_user"
    database_password: str = "change_me"

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


@lru_cache
def get_settings() -> Settings:

    return Settings()


settings = get_settings()

import logging
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config import settings

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args={"timeout": 5},
)

session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db_session() -> AsyncGenerator[AsyncSession]:
    async with session_factory() as session:
        yield session


async def check_database_connection() -> None:
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))


async def initialize_database() -> None:
   

    # The import is intentionally placed here.
    # It registers every ORM model in Base.metadata.
    import orm_models  # noqa: F401

    if (
        settings.reset_database_on_startup
        and not settings.is_database_reset_allowed
    ):
        raise RuntimeError(
            "Database reset is only allowed in development or test "
            "environments. Set RESET_DATABASE_ON_STARTUP=false."
        )

    async with engine.begin() as connection:
        if settings.reset_database_on_startup:
            logger.warning(
                "RESET_DATABASE_ON_STARTUP is enabled. "
                "All BookHive tables and their data will be deleted."
            )

            await connection.run_sync(Base.metadata.drop_all)

            logger.info("Existing BookHive database tables were dropped.")

        await connection.run_sync(Base.metadata.create_all)

    logger.info("BookHive database tables are ready.")


async def close_database_connection() -> None:
    await engine.dispose()
    logger.info("BookHive database connection pool was closed.")

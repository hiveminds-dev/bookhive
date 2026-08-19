import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from data_seed import seed_database
from database import (
    close_database_connection,
    initialize_database,
    session_factory,
)
from routers import health_router
from routers.author_router import router as author_router
from routers.user_router import router as user_router
from routers.book_router import router as book_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    logger.info("Starting the BookHive API.")

    try:
        await initialize_database()

        if settings.seed_database_on_startup:
            async with session_factory() as session:
                await seed_database(session)
        else:
            logger.info(
                "Database seeding is disabled by "
                "SEED_DATABASE_ON_STARTUP."
            )

        yield

    finally:
        await close_database_connection()
        logger.info("BookHive API stopped.")


app = FastAPI(
    title=f"{settings.app_name} API",
    description="Backend API for the BookHive platform.",
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    health_router,
    prefix=settings.api_prefix,
)

app.include_router(
    author_router,
    prefix=settings.api_prefix,
)

app.include_router(
    user_router,
    prefix=settings.api_prefix,
)

app.include_router(
    book_router,
    prefix=settings.api_prefix,
)


@app.get("/", tags=["Root"])
async def root() -> dict[str, str]:
    return {
        "name": f"{settings.app_name} API",
        "version": settings.app_version,
        "environment": settings.app_env,
        "docs": "/docs",
    }

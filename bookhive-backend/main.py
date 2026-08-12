from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import close_database_connection, init_db
from routers import health_router
from routers.author_router import router as author_router
from routers.user_router import router as user_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    await init_db()
    yield
    await close_database_connection()

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

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(author_router, prefix=settings.api_prefix)
app.include_router(user_router, prefix=settings.api_prefix)

@app.get("/", tags=["Root"])
async def root() -> dict[str, str]:
    return {
        "name": f"{settings.app_name} API",
        "version": settings.app_version,
        "environment": settings.app_env,
        "docs": "/docs",
    }

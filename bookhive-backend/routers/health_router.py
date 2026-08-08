
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from database import check_database_connection

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check() -> dict[str, str]:

    return {
        "status": "healthy",
        "message": "BookHive API is running",
    }


@router.get("/database", response_model=None)
async def database_health_check() -> dict[str, str] | JSONResponse:
    try:
        await check_database_connection()
    except (SQLAlchemyError, OSError) as error:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unavailable",
                "message": "PostgreSQL connection failed",
                "error": error.__class__.__name__,
            },
        )

    return {
        "status": "healthy",
        "message": "PostgreSQL connection is working",
    }

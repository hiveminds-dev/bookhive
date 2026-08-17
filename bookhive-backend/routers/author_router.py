from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.author import ( AuthorRegistrationRequest, AuthorRegistrationResult, AuthorDashboardResult)
from services.author_service import AuthorService

router = APIRouter(prefix="/authors", tags=["Authors"])

author_service = AuthorService()

DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post("/register", response_model=AuthorRegistrationResult, status_code=status.HTTP_201_CREATED)
async def create_author( author_data: AuthorRegistrationRequest, session: DbSession):
    try:
        author = await author_service.create_author(
            session,
            author_data,
        )

        return {
            "message": "Author registration submitted successfully",
            "data": author,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

@router.get("/{author_id}/dashboard", response_model=AuthorDashboardResult, status_code=status.HTTP_200_OK)
async def get_author_dashboard(author_id: int, session: DbSession):
    try:
        dashboard_data = await author_service.get_dashboard_data(
            session,
            author_id
        )

        return {
            "message": "Author dashboard data retrieved successfully",
            "data": dashboard_data
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        ) from exc
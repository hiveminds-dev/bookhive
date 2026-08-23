from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.category import CategoryCreate, CategoryResponse
from services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])

category_service = CategoryService()

DbSession = Annotated[AsyncSession, Depends(get_db_session)]

@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_category(
    category_data: CategoryCreate,
    session: DbSession,
):
    try:
        category = await category_service.create_category(
            session,
            category_data,
        )
        return category

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
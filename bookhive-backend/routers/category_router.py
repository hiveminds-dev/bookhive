from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
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

@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    session: DbSession,
):
    try:
        updated_category = await category_service.update_category(
            session=session,
            category_id=category_id,
            category_data=category_data,
        )
        return updated_category

    except ValueError as exc:

        status_code = (
            status.HTTP_404_NOT_FOUND
            if "not found" in str(exc).lower()
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code,
            detail=str(exc),
        ) from exc

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    session: DbSession,
):
    try:
        category = await category_service.get_category_by_id(
            session=session,
            category_id=category_id,
        )
        return category

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
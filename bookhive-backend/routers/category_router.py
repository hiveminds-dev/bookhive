"""Provides Category API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from dependencies import DbSession, require_admin
from orm_models.user import User
from schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from services.category_service import (
    CategoryConflictError,
    CategoryNotFoundError,
    CategoryService,
)

router = APIRouter(prefix="/categories", tags=["Categories"])
category_service = CategoryService()

AdminUser = Annotated[User, Depends(require_admin)]
CategoryId = Annotated[int, Path(gt=0)]


def map_category_error(exc: ValueError) -> HTTPException:
    if isinstance(exc, CategoryNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        )
    if isinstance(exc, CategoryConflictError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        )
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
    )


@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_category(
    category_data: CategoryCreate,
    session: DbSession,
    _: AdminUser,
):
    try:
        return await category_service.create_category(session, category_data)
    except ValueError as exc:
        raise map_category_error(exc) from exc


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: CategoryId,
    category_data: CategoryUpdate,
    session: DbSession,
    _: AdminUser,
):
    try:
        return await category_service.update_category(
            session=session,
            category_id=category_id,
            category_data=category_data,
        )
    except ValueError as exc:
        raise map_category_error(exc) from exc


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: CategoryId,
    session: DbSession,
):
    try:
        return await category_service.get_category_by_id(
            session=session, category_id=category_id
        )
    except ValueError as exc:
        raise map_category_error(exc) from exc

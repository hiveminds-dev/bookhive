from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from dependencies import get_current_user
from orm_models.user import User
from schemas.user import (
    ProfileImageUploadResponse,
    UserCreate,
    UserProfileResponse,
    UserProfileUpdate,
    UserResponse,
)
from services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

user_service = UserService()

DbSession = Annotated[AsyncSession, Depends(get_db_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]
ProfileImageUpload = Annotated[
    UploadFile,
    File(description="JPG, PNG, or WebP profile image"),
]


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(user_data: UserCreate, session: DbSession):
    try:
        return await user_service.create_user(session, user_data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def get_my_profile(
    session: DbSession,
    current_user: CurrentUser,
) -> UserProfileResponse:
    """Retrieve the complete profile of the currently authenticated user."""
    return await user_service.get_current_user_profile(session, current_user)


@router.patch(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def update_my_profile(
    update_data: UserProfileUpdate,
    session: DbSession,
    current_user: CurrentUser,
) -> UserProfileResponse:
    """Update profile information for the currently authenticated user."""
    return await user_service.update_current_user_profile(
        session,
        current_user,
        update_data,
    )


@router.post(
    "/me/profile-image",
    response_model=ProfileImageUploadResponse,
    status_code=status.HTTP_200_OK,
)
async def upload_profile_image(
    session: DbSession,
    current_user: CurrentUser,
    file: ProfileImageUpload,
) -> ProfileImageUploadResponse:
    """Upload or replace the authenticated user's profile avatar image."""
    return await user_service.upload_profile_image(
        session,
        current_user,
        file,
    )


@router.delete(
    "/me/profile-image",
    status_code=status.HTTP_200_OK,
)
async def delete_profile_image(
    session: DbSession,
    current_user: CurrentUser,
) -> dict[str, str]:
    """Remove the authenticated user's profile avatar image."""
    return await user_service.delete_profile_image(session, current_user)
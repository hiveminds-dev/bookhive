from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from dependencies import DbSession, require_author
from orm_models.user import User
from schemas.author_profile import (
    AuthorProfileCreate,
    AuthorProfileResponse,
    AuthorProfileUpdate,
)
from services.author_profile_service import AuthorProfileService

router = APIRouter(prefix="/authors/profile", tags=["Author Profile"])

profile_service = AuthorProfileService()
CurrentAuthor = Annotated[User, Depends(require_author)]
UserId = Annotated[int, Path(gt=0)]


def ensure_profile_owner(user_id: int, current_author: User) -> None:
    if current_author.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authors can only manage their own profile",
        )


@router.get("/{user_id}", response_model=AuthorProfileResponse)
async def get_profile(
    user_id: UserId,
    session: DbSession,
    current_author: CurrentAuthor,
):
    ensure_profile_owner(user_id, current_author)
    return await profile_service.get_profile(session, user_id)


@router.post(
    "/{user_id}",
    response_model=AuthorProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_profile(
    user_id: UserId,
    profile_data: AuthorProfileCreate,
    session: DbSession,
    current_author: CurrentAuthor,
):
    ensure_profile_owner(user_id, current_author)
    return await profile_service.create_profile(session, user_id, profile_data)


@router.patch("/{user_id}", response_model=AuthorProfileResponse)
async def update_profile(
    user_id: UserId,
    update_data: AuthorProfileUpdate,
    session: DbSession,
    current_author: CurrentAuthor,
):
    ensure_profile_owner(user_id, current_author)
    return await profile_service.update_profile(session, user_id, update_data)

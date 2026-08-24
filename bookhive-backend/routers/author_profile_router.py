from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from database import get_db_session
from schemas.author_profile import AuthorProfileResponse, AuthorProfileCreate, AuthorProfileUpdate
from services.author_profile_service import AuthorProfileService

router = APIRouter(prefix="/authors/profile", tags=["Author Profile"])

profile_service = AuthorProfileService()
DbSession = Annotated[AsyncSession, Depends(get_db_session)]

@router.get("/{user_id}", response_model=AuthorProfileResponse)
async def get_profile(user_id: int, session: DbSession):
    return await profile_service.get_profile(session, user_id)

@router.post("/{user_id}", response_model=AuthorProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(user_id: int, profile_data: AuthorProfileCreate, session: DbSession):
    result = await profile_service.create_profile(session, user_id, profile_data)
    await session.commit()
    return result

@router.patch("/{user_id}", response_model=AuthorProfileResponse)
async def update_profile(user_id: int, update_data: AuthorProfileUpdate, session: DbSession):
    result = await profile_service.update_profile(session, user_id, update_data)
    await session.commit()
    return result
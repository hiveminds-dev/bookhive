from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.exceptions import HTTPException

from repositories.author_profile_repository import AuthorProfileRepository
from schemas.author_profile import AuthorProfileCreate, AuthorProfileUpdate


class AuthorProfileService:
    def __init__(self):
        self.repository = AuthorProfileRepository()

    async def get_profile(self, session: AsyncSession, user_id: int):
        profile = await self.repository.get_by_user_id(session, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author profile not found."
            )
        return profile

    async def create_profile(self, session: AsyncSession, user_id: int, profile_data: AuthorProfileCreate):
        existing_profile = await self.repository.get_by_user_id(session, user_id)
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A profile already exists for this user."
            )

        return await self.repository.create(session, user_id, profile_data)

    async def update_profile(self, session: AsyncSession, user_id: int, update_data: AuthorProfileUpdate):
        profile = await self.repository.get_by_user_id(session, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author profile not found."
            )

        return await self.repository.update(session, profile, update_data)
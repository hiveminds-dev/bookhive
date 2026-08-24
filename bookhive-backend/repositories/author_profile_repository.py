from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models import AuthorProfile
from schemas.author_profile import AuthorProfileCreate, AuthorProfileUpdate


class AuthorProfileRepository:
    async def get_by_user_id(self, session: AsyncSession, user_id: int) -> AuthorProfile | None:
        query = select(AuthorProfile).where(AuthorProfile.user_id == user_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, session: AsyncSession, user_id: int, profile_data: AuthorProfileCreate) -> AuthorProfile:
        profile = AuthorProfile(
            user_id=user_id,
            **profile_data.model_dump()
        )
        session.add(profile)
        await session.flush()
        return profile

    async def update(self, session: AsyncSession, profile: AuthorProfile, update_data: AuthorProfileUpdate) -> AuthorProfile:
        update_dict = update_data.model_dump(exclude_unset=True)

        for key, value in update_dict.items():
            setattr(profile, key, value)

        await session.flush()
        return profile
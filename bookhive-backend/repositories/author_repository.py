from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import AuthorProfile
from schemas.author import AuthorRegistrationRequest


class AuthorRepository:
    async def create(
        self,
        session: AsyncSession,
        user_id: int,
        author_data: AuthorRegistrationRequest,
    ) -> AuthorProfile:
        author = AuthorProfile(
            user_id=user_id,
            pen_name=author_data.pen_name.strip(),
            country=author_data.country.strip() if author_data.country else None,
            preferred_language=(
                author_data.preferred_language.strip()
                if author_data.preferred_language
                else None
            ),
            short_bio=author_data.short_bio.strip() if author_data.short_bio else None,
            profile_image_path=None,
        )

        session.add(author)
        await session.flush()
        await session.refresh(author)

        return author

    async def get_by_user_id(
        self,
        session: AsyncSession,
        user_id: int,
    ) -> AuthorProfile | None:
        result = await session.execute(
            select(AuthorProfile).where(AuthorProfile.user_id == user_id)
        )

        return result.scalar_one_or_none()

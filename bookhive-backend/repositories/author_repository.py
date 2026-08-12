from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.author import AuthorCreate
from orm_models.user import AuthorProfile


class AuthorRepository:

    async def author_create(self, session: AsyncSession, author_data: AuthorCreate) -> AuthorProfile:
        try:
            author = AuthorProfile(
                user_id=author_data.user_id,
                pen_name=author_data.pen_name,
                username=author_data.username,
                country=author_data.country,
                preferred_language=author_data.preferred_language,
                short_bio=author_data.short_bio,
                profile_image_path=author_data.profile_image_path
            )

            session.add(author)

            await session.flush()
            await session.refresh(author)

            return author

        except Exception:
            await session.rollback()
            raise

    async def get_author_by_user_id(self, session: AsyncSession, user_id: int) :
        result = await session.execute(
            select(AuthorProfile).where(AuthorProfile.user_id == user_id)
        )

        return result.scalar_one_or_none()


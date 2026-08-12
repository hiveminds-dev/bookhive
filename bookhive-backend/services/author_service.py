from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import AuthorProfile
from repositories.author_repository import AuthorRepository
from repositories.user_repository import UserRepository
from schemas.author import AuthorRegistrationRequest


class AuthorService:
    def __init__(self):
        self.author_repository = AuthorRepository()
        self.user_repository = UserRepository()

    async def create_author(
        self,
        session: AsyncSession,
        author_data: AuthorRegistrationRequest,
    ) -> AuthorProfile:
        existing_email = await self.user_repository.get_by_email(
            session,
            author_data.email,
        )

        if existing_email:
            raise ValueError("Email address is already registered")

        existing_username = await self.author_repository.get_by_username(
            session,
            author_data.username,
        )

        if existing_username:
            raise ValueError("Username is already registered")

        try:
            user = await self.user_repository.create_author_user(
                session,
                author_data,
            )

            author = await self.author_repository.create(
                session,
                user.id,
                author_data,
            )

            await session.commit()
            await session.refresh(author)

            return author

        except Exception:
            await session.rollback()
            raise
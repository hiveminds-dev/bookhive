from sqlalchemy.ext.asyncio import AsyncSession

from repositories.author_repository import AuthorRepository
from repositories.user_repository import UserRepository
from schemas.author import AuthorRegistrationRequest, AuthorRegistrationResponse


class AuthorService:
    def __init__(self):
        self.author_repository = AuthorRepository()
        self.user_repository = UserRepository()

    async def create_author(
        self,
        session: AsyncSession,
        author_data: AuthorRegistrationRequest,
    ) -> AuthorRegistrationResponse:
        existing_email = await self.user_repository.get_by_email(
            session,
            author_data.email,
        )

        if existing_email:
            raise ValueError("Email address is already registered")

        existing_username = await self.user_repository.get_by_username(
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

            return AuthorRegistrationResponse(
                id=user.id,
                author_profile_id=author.id,
                full_name=user.full_name,
                username=user.username,
                email=user.email,
                role=user.role,
                account_status=user.account_status,
                email_verified=user.email_verified,
                pen_name=author.pen_name,
                country=author.country or "",
                preferred_language=author.preferred_language or "",
                short_bio=author.short_bio or "",
                profile_image_path=author.profile_image_path,
                created_at=user.created_at,
            )

        except Exception:
            await session.rollback()
            raise

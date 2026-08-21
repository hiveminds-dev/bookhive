from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import User
from repositories.user_repository import UserRepository
from schemas.user import UserCreate
from services.email_verification_service import EmailVerificationService


class UserService:
    def __init__(self):
        self.user_repository = UserRepository()
        self.email_verification_service = EmailVerificationService()

    async def create_user(
        self,
        session: AsyncSession,
        user_data: UserCreate,
    ) -> User:
        existing_user = await self.user_repository.get_by_email(
            session,
            user_data.email,
        )

        if existing_user:
            raise ValueError("Email address is already registered")

        existing_username = await self.user_repository.get_by_username(
            session,
            user_data.username,
        )

        if existing_username:
            raise ValueError("Username is already registered")

        try:
            user = await self.user_repository.create_reader(
                session,
                user_data,
            )

            verification_token = await self.email_verification_service.create_token(
                session,
                user,
            )

            await session.commit()
            await session.refresh(user)

            await self.email_verification_service.send_token_after_registration(
                user.email,
                verification_token,
            )

            return user

        except Exception:
            await session.rollback()
            raise

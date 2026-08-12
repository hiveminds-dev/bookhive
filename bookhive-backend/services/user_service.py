from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import User
from repositories.user_repository import UserRepository
from schemas.user import UserCreate


class UserService:
    def __init__(self):
        self.user_repository = UserRepository()

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

        try:
            user = await self.user_repository.create_reader(
                session,
                user_data,
            )

            await session.commit()
            await session.refresh(user)

            return user

        except Exception:
            await session.rollback()
            raise
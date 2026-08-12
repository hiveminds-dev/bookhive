from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import User
from repositories.user_repository import UserRepository
from schemas.user import UserCreate


class UserService:

    def __init__(self):
        self.user_repository = UserRepository()

    async def create_user(self, session: AsyncSession, user_data: UserCreate) -> User:

        user = await session.get(User, user_data.id)

        if user:
            raise ValueError("User not found")

        existing_user = await self.user_repository.get_user_by_id(session, user_data.id)

        if existing_user:
            raise ValueError("This user already has a profile" )

        new_user = await self.user_repository.user_create(session, user_data)

        await session.commit()

        return new_user

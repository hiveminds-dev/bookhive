"""Handles User database work."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import User
from schemas.user import UserCreate


class UserRepository:

    async def user_create(self, session: AsyncSession, user_data: UserCreate) -> User:
        try:
            user = User(
                id=user_data.id,
                full_name=user_data.full_name,
                email=user_data.email,
                password=user_data.password,
                role=user_data.role,
                account_status=user_data.account_status,
                created_at=user_data.created_at,
            )

            session.add(user)

            await session.flush()
            await session.refresh(user)

            return user

        except Exception:
            await session.rollback()
            raise

    async def get_user_by_id(self, session: AsyncSession, id: int) :
        result = await session.execute(
            select(User).where(User.id == id)
        )

        return result.scalar_one_or_none()



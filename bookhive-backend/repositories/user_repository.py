from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import AccountStatus, User, UserRole
from schemas.author import AuthorRegistrationRequest
from schemas.user import UserCreate
from utils.security import hash_password


class UserRepository:
    async def create_reader(self, session: AsyncSession, user_data: UserCreate) -> User:
        user = User(
            full_name=user_data.full_name.strip(),
            email=user_data.email.lower(),
            password_hash=hash_password(user_data.password),
            role=UserRole.READER,
            account_status=AccountStatus.INACTIVE,
            email_verified=False,
        )

        session.add(user)
        await session.flush()
        await session.refresh(user)

        return user

    async def create_author_user(
        self,
        session: AsyncSession,
        author_data: AuthorRegistrationRequest,
    ) -> User:
        user = User(
            full_name=author_data.full_name.strip(),
            email=author_data.email.lower(),
            password_hash=hash_password(author_data.password),
            role=UserRole.AUTHOR,
            account_status=AccountStatus.PENDING,
            email_verified=False,
        )

        session.add(user)
        await session.flush()
        await session.refresh(user)

        return user

    async def get_by_id(self, session: AsyncSession, user_id: int) -> User | None:
        result = await session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, session: AsyncSession, email: str) -> User | None:
        result = await session.execute(
            select(User).where(func.lower(User.email) == email.strip().lower())
        )

        return result.scalar_one_or_none()
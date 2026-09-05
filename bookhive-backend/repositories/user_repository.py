from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from orm_models.user import AccountStatus, ReaderProfile, User, UserRole
from schemas.author import AuthorRegistrationRequest
from schemas.user import UserCreate, UserProfileUpdate
from utils.security import hash_password


class UserRepository:
    async def create_reader(self, session: AsyncSession, user_data: UserCreate) -> User:
        user = User(
            full_name=user_data.full_name.strip(),
            username=user_data.username.strip().lower(),
            email=user_data.email.strip().lower(),
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
            username=author_data.username.strip().lower(),
            email=author_data.email.strip().lower(),
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
        result = await session.execute(
            select(User)
            .options(
                selectinload(User.reader_profile),
                selectinload(User.author_profile),
            )
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, session: AsyncSession, email: str) -> User | None:
        result = await session.execute(
            select(User).where(func.lower(User.email) == email.strip().lower())
        )

        return result.scalar_one_or_none()

    async def get_by_username(
        self,
        session: AsyncSession,
        username: str,
    ) -> User | None:
        result = await session.execute(
            select(User).where(
                func.lower(User.username) == username.strip().lower()
            )
        )

        return result.scalar_one_or_none()

    async def get_reader_profile_by_user_id(
        self,
        session: AsyncSession,
        user_id: int,
    ) -> ReaderProfile | None:
        result = await session.execute(
            select(ReaderProfile).where(ReaderProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_or_create_reader_profile(
        self,
        session: AsyncSession,
        user_id: int,
    ) -> ReaderProfile:
        profile = await self.get_reader_profile_by_user_id(session, user_id)
        if profile is None:
            profile = ReaderProfile(user_id=user_id)
            session.add(profile)
            await session.flush()
            await session.refresh(profile)
        return profile

    async def update_user_profile(
        self,
        session: AsyncSession,
        user: User,
        update_data: UserProfileUpdate,
    ) -> User:
        update_dict = update_data.model_dump(exclude_unset=True)

        if "full_name" in update_dict and update_dict["full_name"] is not None:
            user.full_name = update_dict["full_name"]

        if "username" in update_dict and update_dict["username"] is not None:
            user.username = update_dict["username"]

        profile_fields = {"country", "preferred_language", "short_bio"}
        has_profile_updates = any(field in update_dict for field in profile_fields)

        if has_profile_updates:
            profile = await self.get_or_create_reader_profile(session, user.id)
            for field in profile_fields:
                if field in update_dict:
                    setattr(profile, field, update_dict[field])

        await session.flush()
        return user

    async def update_profile_image(
        self,
        session: AsyncSession,
        user_id: int,
        image_path: str,
    ) -> ReaderProfile:
        profile = await self.get_or_create_reader_profile(session, user_id)
        profile.profile_image_path = image_path
        await session.flush()
        await session.refresh(profile)
        return profile

    async def remove_profile_image(
        self,
        session: AsyncSession,
        user_id: int,
    ) -> ReaderProfile | None:
        profile = await self.get_reader_profile_by_user_id(session, user_id)
        if profile is not None:
            profile.profile_image_path = None
            await session.flush()
            await session.refresh(profile)
        return profile

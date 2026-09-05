import logging

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import User
from repositories.user_repository import UserRepository
from schemas.user import (
    ProfileImageUploadResponse,
    UserCreate,
    UserProfileResponse,
    UserProfileUpdate,
)
from services.email_verification_service import EmailVerificationService
from utils.file_handler import (
    FileUploadError,
    delete_stored_file,
    save_profile_image,
)

logger = logging.getLogger(__name__)


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

    async def get_current_user_profile(
        self,
        session: AsyncSession,
        user: User,
    ) -> UserProfileResponse:
        """Return the complete profile for the authenticated user."""
        # Ensure latest user entity with reader_profile loaded
        fresh_user = await self.user_repository.get_by_id(session, user.id)
        if fresh_user is None:
            fresh_user = user

        reader_profile = fresh_user.reader_profile
        country = reader_profile.country if reader_profile else None
        preferred_language = reader_profile.preferred_language if reader_profile else None
        short_bio = reader_profile.short_bio if reader_profile else None
        profile_image_path = reader_profile.profile_image_path if reader_profile else None

        # Fallback to author_profile if user is an author and reader_profile is empty
        if not country and fresh_user.author_profile and fresh_user.author_profile.country:
            country = fresh_user.author_profile.country
        if not preferred_language and fresh_user.author_profile and fresh_user.author_profile.preferred_language:
            preferred_language = fresh_user.author_profile.preferred_language
        if not short_bio and fresh_user.author_profile and fresh_user.author_profile.short_bio:
            short_bio = fresh_user.author_profile.short_bio
        if not profile_image_path and fresh_user.author_profile and fresh_user.author_profile.profile_image_path:
            profile_image_path = fresh_user.author_profile.profile_image_path

        profile_image_url = self._to_public_storage_url(profile_image_path)

        return UserProfileResponse(
            id=fresh_user.id,
            full_name=fresh_user.full_name,
            username=fresh_user.username,
            email=fresh_user.email,
            role=fresh_user.role,
            account_status=fresh_user.account_status,
            email_verified=fresh_user.email_verified,
            created_at=fresh_user.created_at,
            updated_at=fresh_user.updated_at,
            country=country,
            preferred_language=preferred_language,
            short_bio=short_bio,
            profile_image_path=profile_image_path,
            profile_image_url=profile_image_url,
        )

    async def update_current_user_profile(
        self,
        session: AsyncSession,
        user: User,
        update_data: UserProfileUpdate,
    ) -> UserProfileResponse:
        """Update authenticated user's profile with partial data."""
        if update_data.username is not None and update_data.username.lower() != user.username.lower():
            existing_user = await self.user_repository.get_by_username(
                session,
                update_data.username,
            )
            if existing_user is not None and existing_user.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username is already registered",
                )

        try:
            updated_user = await self.user_repository.update_user_profile(
                session,
                user,
                update_data,
            )
            await session.commit()
            await session.refresh(updated_user)
            return await self.get_current_user_profile(session, updated_user)
        except HTTPException:
            await session.rollback()
            raise
        except Exception:
            await session.rollback()
            raise

    async def upload_profile_image(
        self,
        session: AsyncSession,
        user: User,
        upload_file: UploadFile,
    ) -> ProfileImageUploadResponse:
        """Upload and associate a profile image for the authenticated user."""
        try:
            image_path = await save_profile_image(upload_file)
        except FileUploadError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

        reader_profile = await self.user_repository.get_reader_profile_by_user_id(session, user.id)
        old_image_path = reader_profile.profile_image_path if reader_profile else None

        try:
            profile = await self.user_repository.update_profile_image(
                session,
                user.id,
                image_path,
            )
            await session.commit()
            await session.refresh(profile)

            if old_image_path and old_image_path != image_path:
                try:
                    await delete_stored_file(old_image_path)
                except Exception as exc:
                    logger.warning(
                        "Failed to delete previous profile image %s: %s",
                        old_image_path,
                        exc,
                    )

            public_url = self._to_public_storage_url(image_path)
            return ProfileImageUploadResponse(
                message="Profile image uploaded successfully",
                profile_image_path=image_path,
                profile_image_url=public_url or f"/{image_path}",
            )
        except Exception:
            await session.rollback()
            try:
                await delete_stored_file(image_path)
            except Exception:
                pass
            raise

    async def delete_profile_image(
        self,
        session: AsyncSession,
        user: User,
    ) -> dict[str, str]:
        """Remove profile image for the authenticated user."""
        reader_profile = await self.user_repository.get_reader_profile_by_user_id(session, user.id)
        old_image_path = reader_profile.profile_image_path if reader_profile else None

        try:
            await self.user_repository.remove_profile_image(session, user.id)
            await session.commit()

            if old_image_path:
                try:
                    await delete_stored_file(old_image_path)
                except Exception as exc:
                    logger.warning(
                        "Failed to delete profile image file %s: %s",
                        old_image_path,
                        exc,
                    )

            return {"message": "Profile image removed successfully"}
        except Exception:
            await session.rollback()
            raise

    @staticmethod
    def _to_public_storage_url(stored_path: str | None) -> str | None:
        """Convert a stored relative path into a public URL."""
        if stored_path is None:
            return None

        normalized_path = (
            stored_path
            .strip()
            .replace("\\", "/")
            .lstrip("/")
        )

        if not normalized_path or ".." in normalized_path:
            return None

        if normalized_path.startswith(("http://", "https://")):
            return normalized_path

        if not normalized_path.startswith("storage/"):
            return None

        return f"/{normalized_path}"

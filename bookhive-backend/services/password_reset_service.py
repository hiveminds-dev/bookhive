import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from orm_models.user import PasswordResetToken, User
from repositories.user_repository import UserRepository
from services.email_sender import EmailDeliveryError, EmailSender
from utils.security import hash_password

logger = logging.getLogger(__name__)


class PasswordResetError(ValueError):
    pass


class PasswordResetService:
    def __init__(self):
        self.user_repository = UserRepository()
        self.email_sender = EmailSender()

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    async def request_reset(self, session: AsyncSession, email: str) -> None:
        user = await self.user_repository.get_by_email(session, email)
        if user is None:
            return

        await session.execute(
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None),
            )
            .values(used_at=datetime.now(UTC))
        )

        raw_token = secrets.token_urlsafe(32)
        session.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=self._hash_token(raw_token),
                expires_at=datetime.now(UTC)
                + timedelta(minutes=settings.password_reset_token_expire_minutes),
            )
        )
        await session.commit()

        try:
            await self.email_sender.send_password_reset_email(user.email, raw_token)
        except EmailDeliveryError:
            logger.exception("Unable to deliver password reset email to %s", user.email)
            raise

    async def reset_password(
        self,
        session: AsyncSession,
        raw_token: str,
        new_password: str,
    ) -> User:
        result = await session.execute(
            select(PasswordResetToken)
            .options(selectinload(PasswordResetToken.user))
            .where(
                PasswordResetToken.token_hash == self._hash_token(raw_token),
                PasswordResetToken.used_at.is_(None),
            )
        )
        reset_token = result.scalar_one_or_none()
        if reset_token is None:
            raise PasswordResetError("Invalid or already used password reset token")

        expires_at = reset_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at <= datetime.now(UTC):
            raise PasswordResetError("Password reset token has expired")

        user = reset_token.user
        user.password_hash = hash_password(new_password)
        reset_token.used_at = datetime.now(UTC)

        await session.execute(
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.id != reset_token.id,
                PasswordResetToken.used_at.is_(None),
            )
            .values(used_at=datetime.now(UTC))
        )
        await session.commit()
        await session.refresh(user)
        return user

import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from orm_models.user import (
    AccountStatus,
    EmailVerificationToken,
    User,
    UserRole,
)
from repositories.user_repository import UserRepository
from services.email_sender import EmailDeliveryError, EmailSender

logger = logging.getLogger(__name__)


class EmailVerificationError(ValueError):
    pass


class EmailVerificationCooldownError(EmailVerificationError):
    def __init__(self, retry_after: int):
        self.retry_after = max(1, retry_after)
        super().__init__(
            f"Please wait {self.retry_after} seconds before requesting another email"
        )


class EmailVerificationService:
    def __init__(self):
        self.user_repository = UserRepository()
        self.email_sender = EmailSender()

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    async def create_token(self, session: AsyncSession, user: User) -> str:
        await session.execute(
            update(EmailVerificationToken)
            .where(
                EmailVerificationToken.user_id == user.id,
                EmailVerificationToken.used_at.is_(None),
            )
            .values(used_at=datetime.now(UTC))
        )

        raw_token = secrets.token_urlsafe(32)
        session.add(
            EmailVerificationToken(
                user_id=user.id,
                token_hash=self._hash_token(raw_token),
                expires_at=datetime.now(UTC)
                + timedelta(
                    minutes=settings.email_verification_token_expire_minutes,
                ),
            )
        )
        await session.flush()
        return raw_token

    async def send_token(self, email: str, token: str) -> None:
        await self.email_sender.send_verification_email(email, token)

    async def send_token_after_registration(self, email: str, token: str) -> None:
        try:
            await self.send_token(email, token)
        except EmailDeliveryError:
            # The account and token have already been committed. Keep registration
            # successful so the user can retry from the resend screen.
            logger.exception(
                "Registration completed, but verification email delivery failed for %s",
                email,
            )

    async def verify(self, session: AsyncSession, raw_token: str) -> User:
        result = await session.execute(
            select(EmailVerificationToken)
            .options(selectinload(EmailVerificationToken.user))
            .where(
                EmailVerificationToken.token_hash == self._hash_token(raw_token),
                EmailVerificationToken.used_at.is_(None),
            )
        )
        verification_token = result.scalar_one_or_none()

        if verification_token is None:
            raise EmailVerificationError("Invalid or already used verification token")

        expires_at = verification_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)

        if expires_at <= datetime.now(UTC):
            raise EmailVerificationError("Verification token has expired")

        user = verification_token.user
        user.email_verified = True
        if user.role == UserRole.READER and user.account_status == AccountStatus.INACTIVE:
            user.account_status = AccountStatus.ACTIVE
        verification_token.used_at = datetime.now(UTC)

        await session.commit()
        await session.refresh(user)
        return user

    async def resend(self, session: AsyncSession, email: str) -> None:
        user = await self.user_repository.get_by_email(session, email)
        if user is None or user.email_verified:
            return

        result = await session.execute(
            select(EmailVerificationToken.created_at)
            .where(EmailVerificationToken.user_id == user.id)
            .order_by(EmailVerificationToken.created_at.desc())
            .limit(1)
        )
        last_sent_at = result.scalar_one_or_none()
        if last_sent_at is not None:
            if last_sent_at.tzinfo is None:
                last_sent_at = last_sent_at.replace(tzinfo=UTC)

            elapsed = datetime.now(UTC) - last_sent_at
            cooldown = settings.email_verification_resend_cooldown_seconds
            remaining = cooldown - int(elapsed.total_seconds())
            if remaining > 0:
                raise EmailVerificationCooldownError(remaining)

        token = await self.create_token(session, user)
        await session.commit()
        await self.send_token(user.email, token)

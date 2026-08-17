import hashlib
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
from services.email_sender import EmailSender


class EmailVerificationError(ValueError):
    pass


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

        token = await self.create_token(session, user)
        await session.commit()
        await self.send_token(user.email, token)

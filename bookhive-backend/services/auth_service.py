from datetime import UTC, datetime

import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from orm_models.user import AccountStatus, RevokedAccessToken, User, UserRole
from repositories.user_repository import UserRepository
from schemas.auth import AuthenticatedUserResponse, LoginRequest, LoginResponse
from utils.security import create_access_token, decode_access_token, verify_password


class AuthenticationError(ValueError):
    pass


class AccountAccessError(ValueError):
    pass


class AuthService:
    def __init__(self):
        self.user_repository = UserRepository()

    async def login(
        self,
        session: AsyncSession,
        credentials: LoginRequest,
    ) -> LoginResponse:
        user = await self.user_repository.get_by_email(session, credentials.email)

        if user is None or not verify_password(
            credentials.password,
            user.password_hash,
        ):
            raise AuthenticationError("Invalid email address or password")

        self._validate_account_access(user)
        token = create_access_token(user.id, user.role.value)

        return LoginResponse(
            access_token=token,
            expires_in=settings.access_token_expire_minutes * 60,
            user=self.to_response(user),
        )

    async def logout(
        self,
        session: AsyncSession,
        token: str,
        user: User,
    ) -> None:
        try:
            payload = decode_access_token(token)
            token_id = payload["jti"]
            expires_at = datetime.fromtimestamp(payload["exp"], UTC)
        except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as exc:
            raise AuthenticationError("Invalid or expired access token") from exc

        session.add(
            RevokedAccessToken(
                user_id=user.id,
                jti=token_id,
                expires_at=expires_at,
            )
        )
        await session.commit()

    @staticmethod
    def _validate_account_access(user: User) -> None:
        if not user.email_verified:
            raise AccountAccessError("Please verify your email address before signing in")

        blocked_statuses = {
            AccountStatus.REJECTED,
            AccountStatus.SUSPENDED,
            AccountStatus.INACTIVE,
        }
        if user.account_status in blocked_statuses:
            raise AccountAccessError("This account is not currently allowed to sign in")

        if user.role == UserRole.AUTHOR and user.account_status != AccountStatus.APPROVED:
            raise AccountAccessError("Your author account is waiting for admin approval")

        if user.role in {UserRole.READER, UserRole.ADMIN} and (
            user.account_status != AccountStatus.ACTIVE
        ):
            raise AccountAccessError("This account is not currently active")

    @staticmethod
    def to_response(user: User) -> AuthenticatedUserResponse:
        return AuthenticatedUserResponse(
            id=user.id,
            full_name=user.full_name,
            username=user.username,
            email=user.email,
            role=user.role.value,
            account_status=user.account_status.value,
            email_verified=user.email_verified,
        )

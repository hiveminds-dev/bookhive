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

        active_status_roles = {
            UserRole.READER,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        }
        if (
            user.role in active_status_roles
            and user.account_status != AccountStatus.ACTIVE
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

    async def update_profile(
        self,
        session: AsyncSession,
        user: User,
        full_name: str,
        email: str,
    ) -> AuthenticatedUserResponse:
        user.full_name = full_name
        user.email = email
        await session.commit()
        await session.refresh(user)
        return self.to_response(user)

    _password_change_codes: dict[int, tuple[str, datetime]] = {}

    async def request_password_change_otp(
        self,
        session: AsyncSession,
        user: User,
        current_pass: str,
    ) -> None:
        import random
        from datetime import datetime, timedelta

        from services.email_sender import EmailSender
        from utils.security import verify_password

        if not verify_password(current_pass, user.password_hash):
            raise AuthenticationError("Incorrect current password")

        code = f"{random.randint(100000, 999999)}"
        expires_at = datetime.now(UTC) + timedelta(minutes=10)
        AuthService._password_change_codes[user.id] = (code, expires_at)

        email_sender = EmailSender()
        await email_sender.send_password_change_otp(user.email, code)

    async def verify_password_change_otp(
        self,
        session: AsyncSession,
        user: User,
        otp_code: str,
        current_pass: str,
        new_pass: str,
    ) -> None:
        from datetime import datetime

        from utils.security import hash_password, verify_password

        if not verify_password(current_pass, user.password_hash):
            raise AuthenticationError("Incorrect current password")

        record = AuthService._password_change_codes.get(user.id)
        if not record:
            raise AuthenticationError("No verification code found. Please request a new code.")

        stored_code, expires_at = record
        if datetime.now(UTC) > expires_at:
            AuthService._password_change_codes.pop(user.id, None)
            raise AuthenticationError("Verification code has expired. Please request a new code.")

        if stored_code != otp_code.strip():
            raise AuthenticationError("Invalid 6-digit verification code. Please check your email.")

        user.password_hash = hash_password(new_pass)
        await session.commit()
        AuthService._password_change_codes.pop(user.id, None)

    async def change_password(
        self,
        session: AsyncSession,
        user: User,
        current_pass: str,
        new_pass: str,
    ) -> None:
        from utils.security import hash_password, verify_password
        if not verify_password(current_pass, user.password_hash):
            raise AuthenticationError("Incorrect current password")
        user.password_hash = hash_password(new_pass)
        await session.commit()

    async def is_email_available(
        self,
        session: AsyncSession,
        email: str,
    ) -> bool:
        normalized_email = email.strip().lower()
        user = await self.user_repository.get_by_email(session, normalized_email)
        return user is None

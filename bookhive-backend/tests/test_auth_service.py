from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from orm_models.user import AccountStatus, UserRole
from schemas.auth import LoginRequest
from services.auth_service import AccountAccessError, AuthenticationError, AuthService


def make_user(
    role=UserRole.READER,
    status=AccountStatus.ACTIVE,
    verified=True,
):
    return SimpleNamespace(
        id=7,
        full_name="Test User",
        username="test_user",
        email="test@example.com",
        password_hash="stored-hash",
        role=role,
        account_status=status,
        email_verified=verified,
    )


@pytest.mark.asyncio
async def test_verified_active_reader_can_login(monkeypatch):
    service = AuthService()
    service.user_repository.get_by_email = AsyncMock(return_value=make_user())
    monkeypatch.setattr("services.auth_service.verify_password", lambda *_: True)
    monkeypatch.setattr("services.auth_service.create_access_token", lambda *_: "jwt-token")

    response = await service.login(
        AsyncMock(),
        LoginRequest(email="test@example.com", password="correct-password"),
    )

    assert response.access_token == "jwt-token"
    assert response.user.role == "reader"
    assert response.user.account_status == "active"


@pytest.mark.asyncio
async def test_invalid_password_uses_generic_error(monkeypatch):
    service = AuthService()
    service.user_repository.get_by_email = AsyncMock(return_value=make_user())
    monkeypatch.setattr("services.auth_service.verify_password", lambda *_: False)

    with pytest.raises(AuthenticationError, match="Invalid email address or password"):
        await service.login(
            AsyncMock(),
            LoginRequest(email="test@example.com", password="wrong-password"),
        )


def test_unverified_account_is_blocked():
    with pytest.raises(AccountAccessError, match="verify your email"):
        AuthService._validate_account_access(make_user(verified=False))


def test_pending_author_is_blocked_until_admin_approval():
    with pytest.raises(AccountAccessError, match="waiting for admin approval"):
        AuthService._validate_account_access(
            make_user(role=UserRole.AUTHOR, status=AccountStatus.PENDING),
        )


def test_approved_author_can_login():
    AuthService._validate_account_access(
        make_user(role=UserRole.AUTHOR, status=AccountStatus.APPROVED),
    )


def test_active_super_admin_can_login():
    AuthService._validate_account_access(
        make_user(role=UserRole.SUPER_ADMIN, status=AccountStatus.ACTIVE),
    )


def test_inactive_super_admin_is_blocked():
    with pytest.raises(AccountAccessError, match="not currently allowed"):
        AuthService._validate_account_access(
            make_user(role=UserRole.SUPER_ADMIN, status=AccountStatus.INACTIVE),
        )


@pytest.mark.asyncio
async def test_logout_revokes_the_current_access_token(monkeypatch):
    service = AuthService()
    session = SimpleNamespace(add=MagicMock(), commit=AsyncMock())
    expires_at = datetime.now(UTC) + timedelta(minutes=30)
    monkeypatch.setattr(
        "services.auth_service.decode_access_token",
        lambda _: {
            "jti": "760b79df-3dcc-4ef0-a778-54593b33717d",
            "exp": int(expires_at.timestamp()),
        },
    )
    user = make_user()

    await service.logout(session, "access-token", user)

    revoked_token = session.add.call_args.args[0]
    assert revoked_token.user_id == user.id
    assert revoked_token.jti == "760b79df-3dcc-4ef0-a778-54593b33717d"
    session.commit.assert_awaited_once()

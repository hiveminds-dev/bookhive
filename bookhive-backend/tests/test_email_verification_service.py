from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from orm_models.user import AccountStatus, UserRole
from services.email_verification_service import (
    EmailVerificationError,
    EmailVerificationService,
)


def make_session_with_token(token):
    result = MagicMock()
    result.scalar_one_or_none.return_value = token
    session = AsyncMock()
    session.execute.return_value = result
    return session


@pytest.mark.asyncio
async def test_reader_becomes_active_after_email_verification():
    user = SimpleNamespace(
        role=UserRole.READER,
        account_status=AccountStatus.INACTIVE,
        email_verified=False,
    )
    token = SimpleNamespace(
        user=user,
        expires_at=datetime.now(UTC) + timedelta(minutes=30),
        used_at=None,
    )
    session = make_session_with_token(token)

    verified_user = await EmailVerificationService().verify(session, "valid-token")

    assert verified_user.email_verified is True
    assert verified_user.account_status == AccountStatus.ACTIVE
    assert token.used_at is not None
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_author_remains_pending_after_email_verification():
    user = SimpleNamespace(
        role=UserRole.AUTHOR,
        account_status=AccountStatus.PENDING,
        email_verified=False,
    )
    token = SimpleNamespace(
        user=user,
        expires_at=datetime.now(UTC) + timedelta(minutes=30),
        used_at=None,
    )
    session = make_session_with_token(token)

    await EmailVerificationService().verify(session, "valid-token")

    assert user.email_verified is True
    assert user.account_status == AccountStatus.PENDING


@pytest.mark.asyncio
async def test_expired_token_is_rejected():
    token = SimpleNamespace(
        user=SimpleNamespace(),
        expires_at=datetime.now(UTC) - timedelta(seconds=1),
        used_at=None,
    )
    session = make_session_with_token(token)

    with pytest.raises(EmailVerificationError, match="expired"):
        await EmailVerificationService().verify(session, "expired-token")

    session.commit.assert_not_awaited()


def test_verification_token_is_hashed_before_storage():
    raw_token = "verification-token"

    hashed_token = EmailVerificationService._hash_token(raw_token)

    assert hashed_token != raw_token
    assert len(hashed_token) == 64

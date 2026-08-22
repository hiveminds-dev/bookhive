from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from services.password_reset_service import PasswordResetError, PasswordResetService


@pytest.mark.asyncio
async def test_request_reset_uses_generic_noop_for_unknown_email():
    service = PasswordResetService()
    service.user_repository.get_by_email = AsyncMock(return_value=None)
    service.email_sender.send_password_reset_email = AsyncMock()
    session = AsyncMock()

    await service.request_reset(session, "missing@example.com")

    session.commit.assert_not_awaited()
    service.email_sender.send_password_reset_email.assert_not_awaited()


@pytest.mark.asyncio
async def test_request_reset_stores_hashed_token_and_sends_email():
    service = PasswordResetService()
    user = SimpleNamespace(id=7, email="reader@example.com")
    service.user_repository.get_by_email = AsyncMock(return_value=user)
    service.email_sender.send_password_reset_email = AsyncMock()
    session = SimpleNamespace(
        execute=AsyncMock(),
        add=MagicMock(),
        commit=AsyncMock(),
    )

    await service.request_reset(session, user.email)

    reset_token = session.add.call_args.args[0]
    assert len(reset_token.token_hash) == 64
    service.email_sender.send_password_reset_email.assert_awaited_once()
    raw_token = service.email_sender.send_password_reset_email.call_args.args[1]
    assert reset_token.token_hash != raw_token


@pytest.mark.asyncio
async def test_valid_reset_token_changes_password(monkeypatch):
    service = PasswordResetService()
    user = SimpleNamespace(id=7, password_hash="old-hash")
    token = SimpleNamespace(
        id=4,
        user_id=user.id,
        user=user,
        expires_at=datetime.now(UTC) + timedelta(minutes=10),
        used_at=None,
    )
    result = MagicMock()
    result.scalar_one_or_none.return_value = token
    session = SimpleNamespace(
        execute=AsyncMock(return_value=result),
        commit=AsyncMock(),
        refresh=AsyncMock(),
    )
    monkeypatch.setattr("services.password_reset_service.hash_password", lambda _: "new-hash")

    await service.reset_password(session, "valid-reset-token", "NewPassword123!")

    assert user.password_hash == "new-hash"
    assert token.used_at is not None
    session.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_expired_reset_token_is_rejected():
    token = SimpleNamespace(
        user=SimpleNamespace(),
        expires_at=datetime.now(UTC) - timedelta(seconds=1),
        used_at=None,
    )
    result = MagicMock()
    result.scalar_one_or_none.return_value = token
    session = SimpleNamespace(execute=AsyncMock(return_value=result), commit=AsyncMock())

    with pytest.raises(PasswordResetError, match="expired"):
        await PasswordResetService().reset_password(
            session,
            "expired-reset-token",
            "NewPassword123!",
        )

    session.commit.assert_not_awaited()

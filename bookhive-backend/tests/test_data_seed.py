from unittest.mock import AsyncMock, Mock

import pytest

import data_seed
from orm_models.user import AccountStatus, User, UserRole


def configure_valid_admin(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        data_seed.settings,
        "initial_admin_full_name",
        "BookHive Administrator",
    )
    monkeypatch.setattr(
        data_seed.settings,
        "initial_admin_username",
        "bookhive_admin",
    )
    monkeypatch.setattr(
        data_seed.settings,
        "initial_admin_email",
        "admin@bookhive.com",
    )
    monkeypatch.setattr(
        data_seed.settings,
        "initial_admin_password",
        "SecurePass123!",
    )


def configure_valid_super_admin(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        data_seed.settings,
        "initial_super_admin_full_name",
        "BookHive Super Administrator",
    )
    monkeypatch.setattr(
        data_seed.settings,
        "initial_super_admin_username",
        "bookhive_super_admin",
    )
    monkeypatch.setattr(
        data_seed.settings,
        "initial_super_admin_email",
        "superadmin@bookhive.com",
    )
    monkeypatch.setattr(
        data_seed.settings,
        "initial_super_admin_password",
        "SecurePass123!",
    )


def test_initial_admin_settings_reject_placeholder_password(
    monkeypatch: pytest.MonkeyPatch,
):
    configure_valid_admin(monkeypatch)
    monkeypatch.setattr(
        data_seed.settings,
        "initial_admin_password",
        "replace_with_a_secure_password",
    )

    with pytest.raises(RuntimeError, match="secure INITIAL_ADMIN_PASSWORD"):
        data_seed.validate_initial_admin_settings()


def test_initial_admin_settings_reject_invalid_username(
    monkeypatch: pytest.MonkeyPatch,
):
    configure_valid_admin(monkeypatch)
    monkeypatch.setattr(data_seed.settings, "initial_admin_username", "12-admin")

    with pytest.raises(RuntimeError, match="INITIAL_ADMIN_USERNAME"):
        data_seed.validate_initial_admin_settings()


def test_initial_super_admin_settings_reject_placeholder_password(
    monkeypatch: pytest.MonkeyPatch,
):
    configure_valid_super_admin(monkeypatch)
    monkeypatch.setattr(
        data_seed.settings,
        "initial_super_admin_password",
        "replace_with_a_secure_password",
    )

    with pytest.raises(RuntimeError, match="secure INITIAL_SUPER_ADMIN_PASSWORD"):
        data_seed.validate_initial_super_admin_settings()


async def test_seed_initial_admin_includes_required_username(
    monkeypatch: pytest.MonkeyPatch,
):
    configure_valid_admin(monkeypatch)
    monkeypatch.setattr(data_seed, "get_user_by_email", AsyncMock(return_value=None))
    monkeypatch.setattr(
        data_seed,
        "get_user_by_username",
        AsyncMock(return_value=None),
    )
    monkeypatch.setattr(data_seed, "hash_password", Mock(return_value="hashed"))
    session = Mock()
    session.flush = AsyncMock()

    await data_seed.seed_initial_admin(session)

    admin = session.add.call_args.args[0]
    assert admin.username == "bookhive_admin"
    assert admin.email == "admin@bookhive.com"
    assert admin.password_hash == "hashed"
    assert admin.role == UserRole.ADMIN
    assert admin.account_status == AccountStatus.ACTIVE
    session.flush.assert_awaited_once()


async def test_seed_initial_admin_rejects_non_admin_email_conflict(
    monkeypatch: pytest.MonkeyPatch,
):
    configure_valid_admin(monkeypatch)
    existing_reader = User(
        full_name="Existing Reader",
        username="existing_reader",
        email="admin@bookhive.com",
        password_hash="hashed",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
    )
    monkeypatch.setattr(
        data_seed,
        "get_user_by_email",
        AsyncMock(return_value=existing_reader),
    )

    with pytest.raises(RuntimeError, match="non-admin user"):
        await data_seed.seed_initial_admin(Mock())


async def test_seed_initial_super_admin_creates_super_admin(
    monkeypatch: pytest.MonkeyPatch,
):
    configure_valid_super_admin(monkeypatch)
    monkeypatch.setattr(data_seed, "get_user_by_email", AsyncMock(return_value=None))
    monkeypatch.setattr(
        data_seed,
        "get_user_by_username",
        AsyncMock(return_value=None),
    )
    monkeypatch.setattr(data_seed, "hash_password", Mock(return_value="hashed"))
    session = Mock()
    session.flush = AsyncMock()

    await data_seed.seed_initial_super_admin(session)

    super_admin = session.add.call_args.args[0]
    assert super_admin.username == "bookhive_super_admin"
    assert super_admin.email == "superadmin@bookhive.com"
    assert super_admin.password_hash == "hashed"
    assert super_admin.role == UserRole.SUPER_ADMIN
    assert super_admin.account_status == AccountStatus.ACTIVE
    assert super_admin.email_verified is True
    session.flush.assert_awaited_once()


async def test_seed_initial_super_admin_rejects_non_super_admin_email_conflict(
    monkeypatch: pytest.MonkeyPatch,
):
    configure_valid_super_admin(monkeypatch)
    existing_admin = User(
        full_name="Existing Admin",
        username="existing_admin",
        email="superadmin@bookhive.com",
        password_hash="hashed",
        role=UserRole.ADMIN,
        account_status=AccountStatus.ACTIVE,
    )
    monkeypatch.setattr(
        data_seed,
        "get_user_by_email",
        AsyncMock(return_value=existing_admin),
    )

    with pytest.raises(RuntimeError, match="non-super_admin user"):
        await data_seed.seed_initial_super_admin(Mock())


async def test_seed_default_categories_skips_existing_records(monkeypatch):
    monkeypatch.setattr(
        data_seed,
        "get_category_by_name",
        AsyncMock(return_value=object()),
    )
    session = Mock()
    session.flush = AsyncMock()

    await data_seed.seed_default_categories(session)

    session.add.assert_not_called()
    session.flush.assert_not_awaited()

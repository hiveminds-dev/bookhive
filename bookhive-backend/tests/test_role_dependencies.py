from types import SimpleNamespace

import pytest
from fastapi import HTTPException, status

from dependencies import (
    require_admin,
    require_approved_author,
    require_author,
    require_reader,
)
from orm_models.user import AccountStatus, UserRole


def make_user(role: UserRole, account_status: AccountStatus):
    return SimpleNamespace(role=role, account_status=account_status)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("dependency", "allowed_role", "allowed_status"),
    [
        (require_admin, UserRole.ADMIN, AccountStatus.ACTIVE),
        (require_admin, UserRole.SUPER_ADMIN, AccountStatus.ACTIVE),
        (require_author, UserRole.AUTHOR, AccountStatus.PENDING),
        (require_reader, UserRole.READER, AccountStatus.ACTIVE),
        (require_approved_author, UserRole.AUTHOR, AccountStatus.APPROVED),
    ],
)
async def test_role_dependency_allows_matching_role(
    dependency,
    allowed_role,
    allowed_status,
):
    user = make_user(allowed_role, allowed_status)

    assert await dependency(user) is user


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("dependency", "wrong_role"),
    [
        (require_admin, UserRole.READER),
        (require_author, UserRole.ADMIN),
        (require_reader, UserRole.AUTHOR),
        (require_approved_author, UserRole.READER),
    ],
)
async def test_role_dependency_rejects_wrong_role(dependency, wrong_role):
    with pytest.raises(HTTPException) as error:
        await dependency(make_user(wrong_role, AccountStatus.ACTIVE))

    assert error.value.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_approved_author_dependency_rejects_pending_author():
    with pytest.raises(HTTPException) as error:
        await require_approved_author(
            make_user(UserRole.AUTHOR, AccountStatus.PENDING),
        )

    assert error.value.status_code == status.HTTP_403_FORBIDDEN
    assert error.value.detail == "Your author account is not approved"

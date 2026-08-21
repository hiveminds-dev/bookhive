"""Stores shared API dependencies."""

from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from orm_models.user import AccountStatus, User, UserRole
from repositories.user_repository import UserRepository
from services.auth_service import AccountAccessError, AuthService
from utils.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)
user_repository = UserRepository()
auth_service = AuthService()

DbSession = Annotated[AsyncSession, Depends(get_db_session)]
BearerCredentials = Annotated[
    HTTPAuthorizationCredentials | None,
    Depends(bearer_scheme),
]


async def get_current_user(
    session: DbSession,
    credentials: BearerCredentials,
) -> User:
    """Return the active user represented by a valid access token."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = decode_access_token(credentials.credentials)
        if payload.get("type") != "access":
            raise jwt.InvalidTokenError
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        ) from exc

    user = await user_repository.get_by_id(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists",
        )

    try:
        auth_service._validate_account_access(user)
    except AccountAccessError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    return user


async def require_approved_author(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Allow only an approved author to access author book operations."""
    if current_user.role != UserRole.AUTHOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Author access is required",
        )

    if current_user.account_status != AccountStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your author account is not approved",
        )

    return current_user

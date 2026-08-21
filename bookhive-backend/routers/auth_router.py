from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.auth import (
    EmailVerificationResponse,
    AuthenticatedUserResponse,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    ResendVerificationRequest,
)
from services.email_verification_service import (
    EmailVerificationError,
    EmailVerificationService,
)
from services.email_sender import EmailDeliveryError
from services.auth_service import AccountAccessError, AuthenticationError, AuthService
from repositories.user_repository import UserRepository
from utils.security import decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
service = EmailVerificationService()
auth_service = AuthService()
user_repository = UserRepository()
bearer_scheme = HTTPBearer(auto_error=False)
DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, session: DbSession):
    try:
        return await auth_service.login(session, request)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
    except AccountAccessError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc


@router.get("/me", response_model=AuthenticatedUserResponse)
async def get_current_user(
    session: DbSession,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = decode_access_token(credentials.credentials)
        if payload.get("type") != "access":
            raise jwt.InvalidTokenError
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired access token") from exc

    user = await user_repository.get_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User account no longer exists")

    try:
        auth_service._validate_account_access(user)
    except AccountAccessError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    return auth_service.to_response(user)


@router.get("/verify-email", response_model=EmailVerificationResponse)
async def verify_email(
    session: DbSession,
    token: str = Query(min_length=20),
):
    try:
        user = await service.verify(session, token)
    except EmailVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return EmailVerificationResponse(
        message="Email verified successfully",
        role=user.role.value,
        account_status=user.account_status.value,
    )


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    request: ResendVerificationRequest,
    session: DbSession,
):
    try:
        await service.resend(session, request.email)
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    return MessageResponse(
        message="If the account exists and is unverified, a new link has been sent."
    )

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from dependencies import (
    BearerCredentials,
    get_current_user as get_authenticated_user,
)
from orm_models.user import User
from schemas.auth import (
    EmailVerificationResponse,
    AuthenticatedUserResponse,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    ResendVerificationRequest,
)
from services.email_verification_service import (
    EmailVerificationCooldownError,
    EmailVerificationError,
    EmailVerificationService,
)
from services.email_sender import EmailDeliveryError
from services.auth_service import AccountAccessError, AuthenticationError, AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
service = EmailVerificationService()
auth_service = AuthService()
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
    current_user: Annotated[User, Depends(get_authenticated_user)],
):
    return auth_service.to_response(current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    session: DbSession,
    credentials: BearerCredentials,
    current_user: Annotated[User, Depends(get_authenticated_user)],
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        await auth_service.logout(session, credentials.credentials, current_user)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    return MessageResponse(message="Signed out successfully")


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
    except EmailVerificationCooldownError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    except EmailDeliveryError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    return MessageResponse(
        message="If the account exists and is unverified, a new link has been sent."
    )

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.auth import (
    EmailVerificationResponse,
    MessageResponse,
    ResendVerificationRequest,
)
from services.email_verification_service import (
    EmailVerificationError,
    EmailVerificationService,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
service = EmailVerificationService()
DbSession = Annotated[AsyncSession, Depends(get_db_session)]


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
    await service.resend(session, request.email)
    return MessageResponse(
        message="If the account exists and is unverified, a new link has been sent."
    )

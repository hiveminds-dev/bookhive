from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.user import UserCreate
from services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

user_service = UserService()

DbSession = Annotated[AsyncSession, Depends(get_db_session)]

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    session: DbSession,
):
    try:
        user = await user_service.create_user(session, user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e
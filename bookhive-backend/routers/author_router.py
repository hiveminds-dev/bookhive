"""Provides Author endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.author import AuthorCreate
from services.author_service import AuthorService

router = APIRouter(prefix="/authors", tags=["Authors"] )

author_service = AuthorService()


@router.post("/register", status_code=status.HTTP_201_CREATED)

async def create_author(author_data: AuthorCreate, session: AsyncSession = Depends(get_db_session)):
    try:
        author = await author_service.create_author(session, author_data)

        return {
            "message": "Author created successfully",
            "data": author
        }

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


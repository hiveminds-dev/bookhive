"""Provides Book endpoints."""
from http.client import HTTPException
from typing import Annotated

from fastapi import APIRouter
from fastapi.params import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from database import get_db_session
from schemas.book import BookResultResponse, BookCreateRequest, BookStatusResultResponse
from services.book_service import BookService

router = APIRouter(prefix="/books", tags=["Books"])

book_service = BookService()

DbSession = Annotated[AsyncSession, Depends(get_db_session)]

@router.post("/", response_model=BookResultResponse, status_code=status.HTTP_201_CREATED)
async def create_draft_book(book_data: BookCreateRequest, author_id: Annotated[int, Query(description="Author's User ID")], session: DbSession,):
    try:
        book = await book_service.create_draft(
            session=session,
            author_id=author_id,
            book_data=book_data,
        )

        return {
            "message": "Draft book created successfully",
            "data": book,
        }

    except Exception as exc:
        raise HTTPException(
            status_codes=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

@router.patch("/{book_id}/submit", response_model=BookStatusResultResponse, status_code=status.HTTP_200_OK)
async def submit_book(
        book_id: int,
        author_id: Annotated[int, Query(description="Author's User ID")],
        session: DbSession
):
    try:
        updated_status = await book_service.submit_book(
            session=session,
            author_id=author_id,
            book_id=book_id
        )

        return {
            "message": "Book submitted for review successfully",
            "data": updated_status,
        }

    except ValueError as exc:
        error_msg = str(exc)

        if "not found" in error_msg.lower():
            status_code = status.HTTP_404_NOT_FOUND
        elif "permission" in error_msg.lower():
            status_code = status.HTTP_403_FORBIDDEN
        else:
            status_code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail=error_msg,
        ) from exc

@router.get("/{book_id}/status", response_model=BookStatusResultResponse, status_code=status.HTTP_200_OK)
async def get_book_status(
    book_id: int,
    author_id: Annotated[int, Query(description="Author's User ID")],
    session: DbSession,
):
    try:
        book_status = await book_service.get_book_status(
            session=session,
            author_id=author_id,
            book_id=book_id,
        )

        return {
            "message": "Book status retrieved successfully",
            "data": book_status,
        }

    except ValueError as exc:
        error_msg = str(exc)
        if "not found" in error_msg.lower():
            status_code = status.HTTP_404_NOT_FOUND
        elif "permission" in error_msg.lower():
            status_code = status.HTTP_403_FORBIDDEN
        else:
            status_code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail=error_msg,
        ) from exc
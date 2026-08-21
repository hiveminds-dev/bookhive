"""Provides authenticated Author Book endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import DbSession, require_approved_author
from orm_models.book import BookStatus
from orm_models.user import User
from schemas.book import (
    BookCreateRequest,
    BookListResultResponse,
    BookResultResponse,
    BookStatusResultResponse,
    BookUpdateRequest,
)
from services.book_service import (
    BookNotFoundError,
    BookPermissionError,
    BookService,
    BookValidationError,
)

router = APIRouter(prefix="/books", tags=["Books"])
book_service = BookService()
ApprovedAuthor = Annotated[User, Depends(require_approved_author)]


def map_book_error(exc: ValueError) -> HTTPException:
    if isinstance(exc, BookNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    if isinstance(exc, BookPermissionError):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post(
    "/",
    response_model=BookResultResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_draft_book(
    book_data: BookCreateRequest,
    session: DbSession,
    current_author: ApprovedAuthor,
):
    try:
        book = await book_service.create_draft(
            session=session,
            author_id=current_author.id,
            book_data=book_data,
        )
    except BookValidationError as exc:
        raise map_book_error(exc) from exc

    return {"message": "Draft book created successfully", "data": book}


@router.get("/mine", response_model=BookListResultResponse)
async def list_my_books(
    session: DbSession,
    current_author: ApprovedAuthor,
    book_status: BookStatus | None = Query(default=None, alias="status"),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    books = await book_service.list_author_books(
        session,
        current_author.id,
        book_status,
        offset,
        limit,
    )
    return {"message": "Author books retrieved successfully", "data": books}


@router.patch("/{book_id}", response_model=BookResultResponse)
async def update_my_book(
    book_id: int,
    book_data: BookUpdateRequest,
    session: DbSession,
    current_author: ApprovedAuthor,
):
    try:
        book = await book_service.update_book(
            session,
            current_author.id,
            book_id,
            book_data,
        )
    except (BookNotFoundError, BookPermissionError, BookValidationError) as exc:
        raise map_book_error(exc) from exc

    return {"message": "Book updated successfully", "data": book}


@router.patch("/{book_id}/submit", response_model=BookStatusResultResponse)
async def submit_book(
    book_id: int,
    session: DbSession,
    current_author: ApprovedAuthor,
):
    try:
        book = await book_service.submit_book(
            session,
            current_author.id,
            book_id,
        )
    except (BookNotFoundError, BookPermissionError, BookValidationError) as exc:
        raise map_book_error(exc) from exc

    return {"message": "Book submitted for review successfully", "data": book}


@router.get("/{book_id}/status", response_model=BookStatusResultResponse)
async def get_book_status(
    book_id: int,
    session: DbSession,
    current_author: ApprovedAuthor,
):
    try:
        book = await book_service.get_book_status(
            session,
            current_author.id,
            book_id,
        )
    except (BookNotFoundError, BookPermissionError) as exc:
        raise map_book_error(exc) from exc

    return {"message": "Book status retrieved successfully", "data": book}

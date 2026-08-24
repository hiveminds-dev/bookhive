"""Provides authenticated Author Book endpoints."""

from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)

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
from utils.file_handler import (
    FileTooLargeError,
    FileUploadError,
    InvalidFileContentError,
    InvalidFileTypeError,
)

router = APIRouter(
    prefix="/books",
    tags=["Books"],
)

book_service = BookService()

ApprovedAuthor = Annotated[
    User,
    Depends(require_approved_author),
]

PdfUpload = Annotated[
    UploadFile,
    File(description="PDF book file"),
]

CoverUpload = Annotated[
    UploadFile,
    File(description="JPG or PNG book cover"),
]

BookStatusFilter = Annotated[
    BookStatus | None,
    Query(alias="status"),
]

OffsetQuery = Annotated[
    int,
    Query(ge=0),
]

LimitQuery = Annotated[
    int,
    Query(ge=1, le=100),
]


def map_book_error(exc: ValueError) -> HTTPException:
    if isinstance(exc, BookNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    if isinstance(exc, BookPermissionError):
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc),
    )


def map_upload_error(exc: FileUploadError) -> HTTPException:
    if isinstance(exc, FileTooLargeError):
        return HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=str(exc),
        )

    if isinstance(exc, InvalidFileTypeError):
        return HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=str(exc),
        )

    if isinstance(exc, InvalidFileContentError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc),
    )


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

    return {
        "message": "Draft book created successfully",
        "data": book,
    }


@router.get(
    "/mine",
    response_model=BookListResultResponse,
)
async def list_my_books(
    session: DbSession,
    current_author: ApprovedAuthor,
    book_status: BookStatusFilter = None,
    offset: OffsetQuery = 0,
    limit: LimitQuery = 20,
):
    books = await book_service.list_author_books(
        session,
        current_author.id,
        book_status,
        offset,
        limit,
    )

    return {
        "message": "Author books retrieved successfully",
        "data": books,
    }


@router.patch(
    "/{book_id}",
    response_model=BookResultResponse,
)
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

    except (
        BookNotFoundError,
        BookPermissionError,
        BookValidationError,
    ) as exc:
        raise map_book_error(exc) from exc

    return {
        "message": "Book updated successfully",
        "data": book,
    }


@router.post(
    "/{book_id}/upload/pdf",
    response_model=BookResultResponse,
)
async def upload_book_pdf(
    book_id: int,
    file: PdfUpload,
    session: DbSession,
    current_author: ApprovedAuthor,
):
    try:
        book = await book_service.upload_pdf(
            session=session,
            author_id=current_author.id,
            book_id=book_id,
            upload=file,
        )

    except (
        BookNotFoundError,
        BookPermissionError,
        BookValidationError,
    ) as exc:
        raise map_book_error(exc) from exc

    except FileUploadError as exc:
        raise map_upload_error(exc) from exc

    return {
        "message": "PDF uploaded successfully",
        "data": book,
    }


@router.post(
    "/{book_id}/upload/cover",
    response_model=BookResultResponse,
)
async def upload_book_cover(
    book_id: int,
    file: CoverUpload,
    session: DbSession,
    current_author: ApprovedAuthor,
):
    try:
        book = await book_service.upload_cover(
            session=session,
            author_id=current_author.id,
            book_id=book_id,
            upload=file,
        )

    except (
        BookNotFoundError,
        BookPermissionError,
        BookValidationError,
    ) as exc:
        raise map_book_error(exc) from exc

    except FileUploadError as exc:
        raise map_upload_error(exc) from exc

    return {
        "message": "Cover image uploaded successfully",
        "data": book,
    }


@router.patch(
    "/{book_id}/submit",
    response_model=BookStatusResultResponse,
)
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

    except (
        BookNotFoundError,
        BookPermissionError,
        BookValidationError,
    ) as exc:
        raise map_book_error(exc) from exc

    return {
        "message": "Book submitted for review successfully",
        "data": book,
    }


@router.get(
    "/{book_id}/status",
    response_model=BookStatusResultResponse,
)
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

    except (
        BookNotFoundError,
        BookPermissionError,
    ) as exc:
        raise map_book_error(exc) from exc

    return {
        "message": "Book status retrieved successfully",
        "data": book,
    }
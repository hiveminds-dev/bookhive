"""Provides rating and review endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from dependencies import DbSession, require_reader
from orm_models.user import User
from schemas.review import (
    PublicReviewResponse,
    ReviewCreateRequest,
    ReviewListResultResponse,
    ReviewResultResponse,
    ReviewUpdateRequest,
)
from services.review_service import (
    ReviewConflictError,
    ReviewNotFoundError,
    ReviewPermissionError,
    ReviewService,
    ReviewValidationError,
)

router = APIRouter(tags=["Ratings and Reviews"])
review_service = ReviewService()

CurrentReader = Annotated[User, Depends(require_reader)]
BookIdPath = Annotated[int, Path(gt=0, description="Book ID")]
ReviewIdPath = Annotated[int, Path(gt=0, description="Review ID")]


def map_review_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ReviewNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    if isinstance(exc, ReviewPermissionError):
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )
    if isinstance(exc, ReviewConflictError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    if isinstance(exc, ReviewValidationError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc),
    )


@router.post(
    "/books/{book_id}/reviews",
    response_model=ReviewResultResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_book_review(
    book_id: BookIdPath,
    review_data: ReviewCreateRequest,
    session: DbSession,
    current_reader: CurrentReader,
):
    """Allow an authenticated reader to submit a rating and review for a published book."""
    try:
        review = await review_service.create_review(
            session=session,
            book_id=book_id,
            reader_id=current_reader.id,
            review_data=review_data,
        )
    except (
        ReviewNotFoundError,
        ReviewPermissionError,
        ReviewConflictError,
        ReviewValidationError,
    ) as exc:
        raise map_review_error(exc) from exc

    return {
        "message": "Review submitted successfully",
        "data": review,
    }


@router.get(
    "/books/{book_id}/reviews",
    response_model=ReviewListResultResponse,
)
async def get_book_reviews(
    book_id: BookIdPath,
    session: DbSession,
):
    """Retrieve all public reviews for a published book."""
    try:
        reviews = await review_service.get_book_reviews(
            session=session,
            book_id=book_id,
        )
    except ReviewNotFoundError as exc:
        raise map_review_error(exc) from exc

    return {
        "message": "Book reviews retrieved successfully",
        "data": reviews,
    }


@router.get(
    "/books/{book_id}/reviews/mine",
    response_model=ReviewResultResponse | dict,
)
async def get_my_book_review(
    book_id: BookIdPath,
    session: DbSession,
    current_reader: CurrentReader,
):
    """Retrieve the authenticated reader's own review for a book, if any."""
    review = await review_service.get_my_review_for_book(
        session=session,
        book_id=book_id,
        reader_id=current_reader.id,
    )
    if review is None:
        return {
            "message": "No review found for this user",
            "data": None,
        }
    return {
        "message": "User review retrieved successfully",
        "data": review,
    }


@router.patch(
    "/reviews/{review_id}",
    response_model=ReviewResultResponse,
)
async def update_book_review(
    review_id: ReviewIdPath,
    update_data: ReviewUpdateRequest,
    session: DbSession,
    current_reader: CurrentReader,
):
    """Allow an authenticated reader to update their own review."""
    try:
        updated = await review_service.update_review(
            session=session,
            review_id=review_id,
            reader_id=current_reader.id,
            update_data=update_data,
        )
    except (
        ReviewNotFoundError,
        ReviewPermissionError,
        ReviewValidationError,
    ) as exc:
        raise map_review_error(exc) from exc

    return {
        "message": "Review updated successfully",
        "data": updated,
    }


@router.delete(
    "/reviews/{review_id}",
)
async def delete_book_review(
    review_id: ReviewIdPath,
    session: DbSession,
    current_reader: CurrentReader,
):
    """Allow an authenticated reader to delete their own review."""
    try:
        await review_service.delete_review(
            session=session,
            review_id=review_id,
            reader_id=current_reader.id,
        )
    except (
        ReviewNotFoundError,
        ReviewPermissionError,
    ) as exc:
        raise map_review_error(exc) from exc

    return {
        "message": "Review deleted successfully",
    }

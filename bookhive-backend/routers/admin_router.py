from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import DbSession, require_admin
from orm_models.user import User
from schemas.admin_schemas import (
    AuthorApplicationResponse,
    BookAdminResponse,
    DashboardStatsResponse,
    SystemLogResponse,
)
from services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin Portal"])
admin_service = AdminService()


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    session: DbSession,
    _: Annotated[User, Depends(require_admin)],
) -> DashboardStatsResponse:
    """Return aggregated platform KPI statistics for the Admin Dashboard."""
    return await admin_service.get_dashboard_stats(session)


@router.get("/books", response_model=list[BookAdminResponse])
async def get_all_books(
    session: DbSession,
    _: Annotated[User, Depends(require_admin)],
) -> list[BookAdminResponse]:
    """Return list of all books in the repository."""
    return await admin_service.get_all_books(session)


@router.get("/authors", response_model=list[AuthorApplicationResponse])
async def get_author_applications(
    session: DbSession,
    _: Annotated[User, Depends(require_admin)],
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> list[AuthorApplicationResponse]:
    """Return list of author applications with optional status filter."""
    return await admin_service.get_author_applications(session, status_filter)


@router.post("/authors/{user_id}/approve")
async def approve_author(
    user_id: int,
    session: DbSession,
    _: Annotated[User, Depends(require_admin)],
) -> dict[str, str]:
    """Approve an author application."""
    success = await admin_service.approve_author(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author user not found",
        )
    return {"message": "Author application approved successfully"}


@router.post("/authors/{user_id}/reject")
async def reject_author(
    user_id: int,
    session: DbSession,
    _: Annotated[User, Depends(require_admin)],
) -> dict[str, str]:
    """Reject an author application."""
    success = await admin_service.reject_author(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author user not found",
        )
    return {"message": "Author application rejected successfully"}


@router.post("/books/{book_id}/approve")
async def approve_book(
    book_id: int,
    session: DbSession,
    _: Annotated[User, Depends(require_admin)],
) -> dict[str, str]:
    """Approve book publication."""
    success = await admin_service.approve_book(session, book_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    return {"message": "Book approved and published successfully"}


@router.post("/books/{book_id}/reject")
async def reject_book(
    book_id: int,
    session: DbSession,
    _: Annotated[User, Depends(require_admin)],
) -> dict[str, str]:
    """Reject book publication."""
    success = await admin_service.reject_book(session, book_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    return {"message": "Book publication rejected"}


@router.get("/system-logs", response_model=list[SystemLogResponse])
async def get_system_logs(
    _: Annotated[User, Depends(require_admin)],
) -> list[SystemLogResponse]:
    """Return platform system logs and health status."""
    return await admin_service.get_system_logs()

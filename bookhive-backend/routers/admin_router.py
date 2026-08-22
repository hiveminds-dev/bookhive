from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from dependencies import require_admin
from orm_models.user import User
from schemas.admin_schemas import (
    AuthorApplicationResponse,
    BookAdminResponse,
    DashboardStatsResponse,
    SystemLogResponse,
)
from services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])
admin_service = AdminService()


@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve platform statistics for the curator dashboard."""
    return await admin_service.get_dashboard_stats(session)


@router.get("/books", response_model=list[BookAdminResponse])
async def get_all_books(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve repository books for admin moderation."""
    return await admin_service.get_all_books(session)


@router.get("/author-applications", response_model=list[AuthorApplicationResponse])
@router.get("/authors", response_model=list[AuthorApplicationResponse])
async def get_author_applications(
    status_filter: str | None = None,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve author applications for approval/rejection."""
    return await admin_service.get_author_applications(session, status_filter=status_filter)


@router.post("/authors/{user_id}/approve")
async def approve_author(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Approve an author application."""
    success = await admin_service.approve_author(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author user not found.",
        )
    return {"message": "Author approved successfully."}


@router.post("/authors/{user_id}/reject")
async def reject_author(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Reject an author application."""
    success = await admin_service.reject_author(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author user not found.",
        )
    return {"message": "Author rejected."}


@router.post("/books/{book_id}/approve")
async def approve_book(
    book_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Approve a manuscript book submission."""
    success = await admin_service.approve_book(session, book_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found.",
        )
    return {"message": "Book approved and published."}


@router.post("/books/{book_id}/reject")
async def reject_book(
    book_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Reject a manuscript book submission."""
    success = await admin_service.reject_book(session, book_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found.",
        )
    return {"message": "Book rejected."}


@router.get("/system-logs", response_model=list[SystemLogResponse])
async def get_system_logs(
    admin_user: User = Depends(require_admin),
):
    """Retrieve system health & activity logs."""
    return await admin_service.get_system_logs()

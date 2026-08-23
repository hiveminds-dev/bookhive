from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from dependencies import require_admin
from orm_models.user import User
from schemas.admin_schemas import (
    AuthorApplicationResponse,
    BookAdminResponse,
    BookStatusUpdateRequest,
    DashboardRecentResponse,
    DashboardStatsResponse,
    ReaderAdminResponse,
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
    search_query: str | None = None,
    category_filter: str | None = None,
    status_filter: str | None = None,
    language_filter: str | None = None,
    timeframe_filter: str | None = None,
    sort_by: str | None = None,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve repository books for admin moderation with backend search & filters."""
    return await admin_service.get_all_books(
        session,
        search_query=search_query,
        category_filter=category_filter,
        status_filter=status_filter,
        language_filter=language_filter,
        timeframe_filter=timeframe_filter,
        sort_by=sort_by,
    )


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


@router.put("/books/{book_id}/status")
async def update_book_status(
    book_id: int,
    req: BookStatusUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Update status of a book (PUBLISHED, DEACTIVATED, DRAFT, REJECTED, etc.)."""
    success = await admin_service.update_book_status(session, book_id, req.status)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found.",
        )
    return {"message": f"Book status updated to {req.status}."}



@router.get("/system-logs", response_model=list[SystemLogResponse])
async def get_system_logs(
    admin_user: User = Depends(require_admin),
):
    """Retrieve system health & activity logs."""
    return await admin_service.get_system_logs()


@router.get("/readers", response_model=list[ReaderAdminResponse])
async def get_all_readers(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve all registered reader accounts."""
    return await admin_service.get_all_readers(session)


@router.get("/dashboard/recent", response_model=DashboardRecentResponse)
async def get_dashboard_recent(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve recent books, readers, and pending author requests for dashboard widgets."""
    return await admin_service.get_dashboard_recent(session)

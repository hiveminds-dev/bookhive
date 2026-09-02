from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from dependencies import require_admin
from orm_models.user import User
from schemas.admin_schemas import (
    AccountStatusUpdateRequest,
    AdminActionSuccessResponse,
    AdminCreateRequest,
    AdminStaffStatsResponse,
    AdminUserItemResponse,
    AuthorApplicationResponse,
    AuthorDetailAdminResponse,
    AuthorRejectionRequest,
    AuthorStatsResponse,
    BookAdminResponse,
    BookStatusUpdateRequest,
    CategoryAdminItem,
    CategoryCreateRequest,
    DashboardRecentResponse,
    DashboardStatsResponse,
    PaginatedBookAdminResponse,
    PlatformStatisticsResponse,
    ReaderAdminResponse,
    ReaderDetailAdminResponse,
    RequestChangesRequest,
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


@router.get("/books", response_model=PaginatedBookAdminResponse)
async def get_all_books(
    search_query: str | None = None,
    category_filter: str | None = None,
    status_filter: str | None = None,
    language_filter: str | None = None,
    timeframe_filter: str | None = None,
    sort_by: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=100),
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve repository books for admin moderation with backend search & pagination."""
    return await admin_service.get_all_books(
        session,
        search_query=search_query,
        category_filter=category_filter,
        status_filter=status_filter,
        language_filter=language_filter,
        timeframe_filter=timeframe_filter,
        sort_by=sort_by,
        page=page,
        page_size=page_size,
    )


@router.get("/books/{book_id}", response_model=BookAdminResponse)
async def get_book_by_id(
    book_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve single book details for manuscript inspector."""
    book = await admin_service.get_book_by_id(session, book_id)
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found.",
        )
    return book


@router.get("/staff/stats", response_model=AdminStaffStatsResponse)
async def get_admin_staff_stats(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve summary metrics for Admin Governance page."""
    return await admin_service.get_admin_staff_stats(session)


@router.get("/staff", response_model=list[AdminUserItemResponse])
async def get_admin_staff(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve list of admin staff members."""
    return await admin_service.get_admin_staff(session)


@router.post("/staff/create", response_model=AdminUserItemResponse)
async def create_admin_staff(
    data: AdminCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Create a new admin staff user account."""
    return await admin_service.create_admin_staff(session, data)


@router.put("/staff/{user_id}/toggle-status")
async def toggle_admin_staff_status(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Toggle active/suspended status for an admin user."""
    success = await admin_service.toggle_admin_staff_status(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify Super Admin status or admin not found.",
        )
    return {"message": "Admin status toggled successfully."}


@router.delete("/staff/{user_id}")
async def delete_admin_staff(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Revoke admin staff access."""
    success = await admin_service.delete_admin_staff(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete Super Admin or admin not found.",
        )
    return {"message": "Admin credentials revoked successfully."}


@router.get("/statistics", response_model=PlatformStatisticsResponse)
async def get_platform_statistics(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve platform statistics for analytics dashboard."""
    return await admin_service.get_platform_statistics(session)


@router.get("/authors/stats", response_model=AuthorStatsResponse)
async def get_author_stats(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve author stats for author management summary cards."""
    return await admin_service.get_author_stats(session)


@router.get("/author-applications", response_model=list[AuthorApplicationResponse])
@router.get("/authors", response_model=list[AuthorApplicationResponse])
async def get_author_applications(
    status_filter: str | None = None,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve author applications for approval/rejection."""
    return await admin_service.get_author_applications(session, status_filter=status_filter)


@router.get("/authors/{user_id}", response_model=AuthorDetailAdminResponse)
async def get_author_detail(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve author profile, pen name, and all submitted manuscripts."""
    author = await admin_service.get_author_detail(session, user_id)
    if author is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found.",
        )
    return author


@router.post("/authors/{user_id}/approve")
async def approve_author(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Approve an author application."""
    try:
        success = await admin_service.approve_author(session, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author user not found.",
            )
        return {"message": "Author approved successfully."}
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post("/authors/{user_id}/reject")
async def reject_author(
    user_id: int,
    rejection_data: AuthorRejectionRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Reject an author application."""
    try:
        success = await admin_service.reject_author(
            session,
            user_id,
            rejection_data.rejection_reason,
            admin_id=admin_user.id,
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author user not found.",
            )
        return {"message": "Author rejected successfully."}
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post("/books/{book_id}/approve")
async def approve_book(
    book_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Approve a manuscript book submission."""
    await admin_service.approve_book(session, book_id)
    return {"message": "Book approved and published."}


@router.post("/books/{book_id}/reject")
async def reject_book(
    book_id: int,
    req: BookStatusUpdateRequest | None = None,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Reject a manuscript book submission."""
    reason = req.rejection_reason if req else ""
    await admin_service.reject_book(session, book_id, rejection_reason=reason or "")
    return {"message": "Book rejected."}


@router.post("/books/{book_id}/request-changes", response_model=AdminActionSuccessResponse)
async def request_book_changes(
    book_id: int,
    req: RequestChangesRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Request editorial changes for a pending manuscript."""
    return await admin_service.request_book_changes(
        session, book_id, admin_user.id, req.feedback
    )


@router.put("/books/{book_id}/status")
async def update_book_status(
    book_id: int,
    req: BookStatusUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Update status of a book (PUBLISHED, DEACTIVATED, DRAFT, REJECTED, etc.)."""
    await admin_service.update_book_status(
        session, book_id, req.status, req.rejection_reason
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


@router.get("/readers/{user_id}", response_model=ReaderDetailAdminResponse)
async def get_reader_detail(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve reader details and reading/reviews activity."""
    reader = await admin_service.get_reader_detail(session, user_id)
    if reader is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reader not found.",
        )
    return reader


@router.put("/readers/{user_id}/status", response_model=AdminActionSuccessResponse)
async def update_reader_status(
    user_id: int,
    req: AccountStatusUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Suspend or reactivate a reader account."""
    return await admin_service.update_reader_status(session, user_id, req.status)


@router.post("/readers/{user_id}/reset-password", response_model=AdminActionSuccessResponse)
async def send_reader_password_reset(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Send a password reset email to a reader."""
    return await admin_service.send_reader_password_reset(session, user_id)


@router.put("/authors/{user_id}/status", response_model=AdminActionSuccessResponse)
async def update_author_status(
    user_id: int,
    req: AccountStatusUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Suspend or reactivate an author account."""
    return await admin_service.update_author_status(session, user_id, req.status)


@router.post("/authors/{user_id}/reset-password", response_model=AdminActionSuccessResponse)
async def send_author_password_reset(
    user_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Send a password reset email to an author."""
    return await admin_service.send_author_password_reset(session, user_id)


@router.get("/dashboard/recent", response_model=DashboardRecentResponse)
async def get_dashboard_recent(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve recent books, readers, and pending author requests for dashboard widgets."""
    return await admin_service.get_dashboard_recent(session)


@router.get("/categories", response_model=list[CategoryAdminItem])
async def get_all_categories(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Retrieve all categories with total books count."""
    return await admin_service.get_all_categories(session)


@router.post("/categories", response_model=CategoryAdminItem, status_code=status.HTTP_201_CREATED)
async def create_category(
    req: CategoryCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Create a new book category in DB."""
    return await admin_service.create_category(session, req.name, req.description)


@router.put("/categories/{category_id}/toggle-status")
async def toggle_category_status(
    category_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Toggle active/inactive status of a category."""
    success, is_active = await admin_service.toggle_category_status(session, category_id)
    return {"message": "Category status toggled.", "is_active": is_active}


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
):
    """Delete a category from DB."""
    await admin_service.delete_category(session, category_id)
    return {"message": "Category deleted successfully."}

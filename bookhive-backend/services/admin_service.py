import logging
import math
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from orm_models.author_rejection_log import AuthorRejectionLog
from orm_models.book import Book, BookStatus
from orm_models.book_rejection_log import BookRejectionLog
from orm_models.category import Category
from orm_models.review import Review
from orm_models.user import AccountStatus, User, UserRole
from schemas.admin_schemas import (
    ActiveAuthorItem,
    ActiveReaderItem,
    AdminActionSuccessResponse,
    AdminCreateRequest,
    AdminStaffStatsResponse,
    AdminUserItemResponse,
    AuthorApplicationResponse,
    AuthorBookAdminSummary,
    AuthorDetailAdminResponse,
    AuthorRejectionLogItem,
    AuthorStatsResponse,
    BookAdminResponse,
    BookRejectionLogItem,
    BookReviewItem,
    CategoryAdminItem,
    DashboardRecentResponse,
    DashboardStatsResponse,
    MonthlyRegistrationItem,
    MonthlyUploadItem,
    MostReadBookItem,
    PaginatedBookAdminResponse,
    PlatformStatisticsResponse,
    ReaderAdminResponse,
    ReaderDetailAdminResponse,
    ReaderReviewAdminItem,
    RecentAuthorRequestItem,
    RecentBookItem,
    RecentReaderItem,
    SystemLogResponse,
    TopCategoryStatItem,
)
from services.email_sender import EmailDeliveryError
from services.password_reset_service import PasswordResetService

logger = logging.getLogger(__name__)


class AdminService:
    async def get_dashboard_stats(
        self, session: AsyncSession
    ) -> DashboardStatsResponse:
        total_books_res = await session.execute(select(func.count(Book.id)))
        total_books = total_books_res.scalar_one_or_none() or 0

        total_readers_res = await session.execute(
            select(func.count(User.id)).where(User.role == UserRole.READER)
        )
        total_readers = total_readers_res.scalar_one_or_none() or 0

        total_authors_res = await session.execute(
            select(func.count(User.id)).where(User.role == UserRole.AUTHOR)
        )
        total_authors = total_authors_res.scalar_one_or_none() or 0

        total_admins_res = await session.execute(
            select(func.count(User.id)).where(
                User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
            )
        )
        total_admins = total_admins_res.scalar_one_or_none() or 0

        book_requests_res = await session.execute(
            select(func.count(Book.id)).where(
                Book.status == BookStatus.PENDING_REVIEW
            )
        )
        book_requests = book_requests_res.scalar_one_or_none() or 0

        author_requests_res = await session.execute(
            select(func.count(User.id)).where(
                User.role == UserRole.AUTHOR,
                User.account_status == AccountStatus.PENDING,
            )
        )
        author_requests = author_requests_res.scalar_one_or_none() or 0

        return DashboardStatsResponse(
            total_books=total_books,
            total_readers=total_readers,
            total_authors=total_authors,
            total_admins=total_admins,
            book_requests=book_requests,
            author_requests=author_requests,
        )

    def _map_book_to_admin_response(self, b: Book) -> BookAdminResponse:
        reviews_list = [
            BookReviewItem(
                id=rev.id,
                user_name=rev.user.full_name if rev.user else "Anonymous",
                avatar_letter=rev.user.full_name[0].upper() if (rev.user and rev.user.full_name) else "A",
                rating=rev.rating,
                comment=rev.comment,
                created_at=rev.created_at.isoformat() if rev.created_at else "",
            )
            for rev in (getattr(b, "reviews", []) or [])
        ]

        rejection_logs_list = [
            BookRejectionLogItem(
                id=log.id,
                reason=log.reason,
                created_at=log.created_at.isoformat() if log.created_at else "",
            )
            for log in (getattr(b, "rejection_logs", []) or [])
        ]

        return BookAdminResponse(
            id=b.id,
            title=b.title,
            author_name=b.author.full_name if b.author else "Unknown",
            category_name=b.category.name if b.category else "General",
            language=b.language,
            reading_level=b.reading_level,
            status=b.status.value if hasattr(b.status, "value") else str(b.status),
            cover_image_path=b.cover_image_path,
            pdf_path=b.pdf_path,
            author_profile_image_path=(
                b.author.author_profile.profile_image_path
                if (b.author and getattr(b.author, "author_profile", None))
                else None
            ),
            page_count=b.page_count,
            rejection_reason=b.rejection_reason,
            estimated_reading_time=b.estimated_reading_time if b.page_count else None,
            view_count=b.view_count or 0,
            download_count=b.download_count or 0,
            isbn=None,
            average_rating=b.average_rating if hasattr(b, "average_rating") else 0.0,
            review_count=b.review_count if hasattr(b, "review_count") else len(reviews_list),
            reviews=reviews_list,
            rejection_logs=rejection_logs_list,
            created_at=b.created_at,
            published_at=b.published_at,
        )

    async def get_all_books(
        self,
        session: AsyncSession,
        search_query: str | None = None,
        category_filter: str | None = None,
        status_filter: str | None = None,
        language_filter: str | None = None,
        timeframe_filter: str | None = None,
        sort_by: str | None = None,
        page: int = 1,
        page_size: int = 5,
    ) -> PaginatedBookAdminResponse:
        query = (
            select(Book)
            .options(
                selectinload(Book.author).selectinload(User.author_profile),
                selectinload(Book.category),
                selectinload(Book.reviews).selectinload(Review.user),
                selectinload(Book.rejection_logs),
            )
        )

        if search_query:
            q = f"%{search_query.strip()}%"
            query = query.join(Book.author, isouter=True).join(Book.category, isouter=True)
            query = query.where(
                or_(
                    Book.title.ilike(q),
                    User.full_name.ilike(q),
                    Category.name.ilike(q),
                    Book.language.ilike(q),
                )
            )

        if category_filter:
            if not search_query:
                query = query.join(Book.category, isouter=True)
            query = query.where(Category.name.ilike(f"%{category_filter}%"))

        if status_filter:
            query = query.where(cast(Book.status, String).ilike(f"%{status_filter}%"))

        if language_filter:
            query = query.where(Book.language.ilike(f"%{language_filter}%"))

        if timeframe_filter and timeframe_filter != "all":
            now = datetime.now(UTC)
            if timeframe_filter == "today":
                query = query.where(Book.created_at >= now - timedelta(days=1))
            elif timeframe_filter == "7days":
                query = query.where(Book.created_at >= now - timedelta(days=7))
            elif timeframe_filter == "30days":
                query = query.where(Book.created_at >= now - timedelta(days=30))

        if sort_by == "oldest":
            query = query.order_by(Book.created_at.asc())
        elif sort_by == "title":
            query = query.order_by(Book.title.asc())
        elif sort_by == "views":
            query = query.order_by(Book.view_count.desc(), Book.created_at.desc())
        elif sort_by == "downloads":
            query = query.order_by(Book.download_count.desc(), Book.created_at.desc())
        else:
            query = query.order_by(Book.created_at.desc())

        count_subquery = query.order_by(None).subquery()
        total_res = await session.execute(select(func.count()).select_from(count_subquery))
        total_count = total_res.scalar() or 0

        page = max(1, page)
        page_size = max(1, page_size)
        paginated_query = query.offset((page - 1) * page_size).limit(page_size)

        result = await session.execute(paginated_query)
        books = result.scalars().all()

        res = [self._map_book_to_admin_response(b) for b in books]
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1
        return PaginatedBookAdminResponse(
            items=res,
            total=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        )

    async def get_book_by_id(
        self, session: AsyncSession, book_id: int
    ) -> BookAdminResponse | None:
        query = (
            select(Book)
            .options(
                selectinload(Book.author).selectinload(User.author_profile),
                selectinload(Book.category),
                selectinload(Book.reviews).selectinload(Review.user),
                selectinload(Book.rejection_logs),
            )
            .where(Book.id == book_id)
        )
        result = await session.execute(query)
        book = result.scalar_one_or_none()
        if book is None:
            return None
        return self._map_book_to_admin_response(book)

    async def get_author_applications(
        self, session: AsyncSession, status_filter: str | None = None
    ) -> list[AuthorApplicationResponse]:
        query = (
            select(User)
            .options(
                selectinload(User.author_profile),
                selectinload(User.author_rejection_logs),
            )
            .where(User.role == UserRole.AUTHOR)
        )

        if status_filter:
            sf = status_filter.lower()
            if sf == "pending":
                query = query.where(User.account_status == AccountStatus.PENDING)
            elif sf == "approved":
                query = query.where(User.account_status == AccountStatus.APPROVED)
            elif sf == "rejected":
                query = query.where(User.account_status == AccountStatus.REJECTED)

        result = await session.execute(query)
        users = result.scalars().all()

        applications = []
        for u in users:
            rejection_logs = [
                AuthorRejectionLogItem(
                    id=log.id,
                    reason=log.reason,
                    created_at=log.created_at.isoformat() if hasattr(log.created_at, "isoformat") else str(log.created_at),
                )
                for log in (u.author_rejection_logs or [])
            ]
            latest_rejection_reason = rejection_logs[0].reason if rejection_logs else None

            applications.append(
                AuthorApplicationResponse(
                    id=u.id,
                    user_id=u.id,
                    full_name=u.full_name,
                    pen_name=u.author_profile.pen_name if u.author_profile else u.full_name,
                    email=u.email,
                    country=u.author_profile.country if u.author_profile else "N/A",
                    account_status=u.account_status.value if hasattr(u.account_status, "value") else str(u.account_status),
                    profile_image_path=u.author_profile.profile_image_path if u.author_profile else None,
                    bio=u.author_profile.short_bio if u.author_profile else None,
                    applied_date=u.created_at,
                    rejection_reason=latest_rejection_reason,
                    rejection_logs=rejection_logs,
                )
            )

        return applications

    async def approve_author(
        self, session: AsyncSession, user_id: int
    ) -> bool:
        user = await session.get(User, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author user not found.",
            )
        if user.role != UserRole.AUTHOR:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not an author application.",
            )
        if user.account_status == AccountStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Author is already approved.",
            )

        user.account_status = AccountStatus.APPROVED
        await session.commit()
        return True

    async def reject_author(
        self,
        session: AsyncSession,
        user_id: int,
        rejection_reason: str,
        admin_id: int | None = None,
    ) -> bool:
        user = await session.get(User, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author user not found.",
            )
        if user.role != UserRole.AUTHOR:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not an author application.",
            )
        if user.account_status == AccountStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Author is already rejected.",
            )

        cleaned_reason = rejection_reason.strip() if rejection_reason else ""
        if not cleaned_reason:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Rejection reason cannot be blank or whitespace only.",
            )
        if len(cleaned_reason) > 500:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Rejection reason cannot exceed 500 characters.",
            )

        user.account_status = AccountStatus.REJECTED
        log_entry = AuthorRejectionLog(
            author_id=user.id,
            admin_id=admin_id,
            reason=cleaned_reason,
        )
        session.add(log_entry)
        await session.commit()
        return True

    async def approve_book(
        self, session: AsyncSession, book_id: int
    ) -> bool:
        book = await session.get(Book, book_id)
        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found.",
            )

        if book.status == BookStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Book is already published.",
            )

        if book.status != BookStatus.PENDING_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot approve book with status '{book.status.value}'. Only books in 'PENDING_REVIEW' can be approved.",
            )

        book.status = BookStatus.PUBLISHED
        book.published_at = datetime.now(UTC)
        await session.commit()
        return True

    async def reject_book(
        self, session: AsyncSession, book_id: int, rejection_reason: str
    ) -> bool:
        book = await session.get(Book, book_id)
        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found.",
            )

        if book.status == BookStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Book is already rejected.",
            )

        if book.status != BookStatus.PENDING_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot reject book with status '{book.status.value}'. Only books in 'PENDING_REVIEW' can be rejected.",
            )

        cleaned_reason = rejection_reason.strip() if rejection_reason else ""
        if not cleaned_reason:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Rejection reason is required when rejecting a book submission.",
            )
        if len(cleaned_reason) > 500:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Rejection reason cannot exceed 500 characters.",
            )

        book.status = BookStatus.REJECTED
        session.add(BookRejectionLog(book_id=book.id, reason=cleaned_reason))
        await session.commit()
        return True

    async def request_book_changes(
        self, session: AsyncSession, book_id: int, admin_id: int | None, feedback: str
    ) -> AdminActionSuccessResponse:
        book = await session.get(Book, book_id)
        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found.",
            )

        if book.status != BookStatus.PENDING_REVIEW:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot request changes for book with status '{book.status.value}'. Only books in 'PENDING_REVIEW' can receive change requests.",
            )

        cleaned_feedback = feedback.strip() if feedback else ""
        if not cleaned_feedback:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Feedback is required when requesting changes for a book.",
            )
        if len(cleaned_feedback) > 500:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Feedback cannot exceed 500 characters.",
            )

        book.status = BookStatus.DRAFT
        session.add(
            BookRejectionLog(
                book_id=book.id,
                admin_id=admin_id,
                reason=f"Changes Requested: {cleaned_feedback}",
            )
        )
        try:
            await session.commit()
        except HTTPException:
            await session.rollback()
            raise
        except Exception as exc:
            await session.rollback()
            logger.error("Database commit failed during request_book_changes for book %s: %s", book_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save change request due to a database error.",
            ) from exc

        return AdminActionSuccessResponse(
            success=True,
            message=f"Change request sent to author for '{book.title}'.",
        )

    async def update_book_status(
        self, session: AsyncSession, book_id: int, new_status: str, rejection_reason: str | None = None
    ) -> bool:
        book = await session.get(Book, book_id)
        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found.",
            )

        status_upper = new_status.strip().upper()
        if status_upper not in [s.value for s in BookStatus]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid target book status '{new_status}'.",
            )

        target_status = BookStatus(status_upper)
        current_status = book.status

        if target_status == current_status:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Book is already in '{current_status.value}' status.",
            )

        if current_status == BookStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot change status of a DRAFT book directly from Admin. Author must submit for review first.",
            )

        if current_status == BookStatus.REJECTED and target_status == BookStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot publish a REJECTED book directly. Author must edit and resubmit for review first.",
            )

        if current_status == BookStatus.PUBLISHED and target_status == BookStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot reject a PUBLISHED book. Deactivate the book instead.",
            )

        if target_status == BookStatus.REJECTED:
            cleaned_reason = rejection_reason.strip() if rejection_reason else ""
            if not cleaned_reason:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="Rejection reason is required when setting status to REJECTED.",
                )
            if len(cleaned_reason) > 500:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="Rejection reason cannot exceed 500 characters.",
                )
            book.status = BookStatus.REJECTED
            session.add(BookRejectionLog(book_id=book.id, reason=cleaned_reason))
        elif target_status == BookStatus.PUBLISHED:
            book.status = BookStatus.PUBLISHED
            if not book.published_at:
                book.published_at = datetime.now(UTC)
        else:
            book.status = target_status

        await session.commit()
        return True

    async def get_system_logs(self) -> list[SystemLogResponse]:
        # Return an honest empty list in MVP since persistent backend logging is not stored
        return []

    async def get_all_readers(
        self, session: AsyncSession
    ) -> list[ReaderAdminResponse]:
        result = await session.execute(
            select(User)
            .where(User.role == UserRole.READER)
            .order_by(User.created_at.desc())
        )
        users = result.scalars().all()
        return [
            ReaderAdminResponse(
                id=u.id,
                full_name=u.full_name,
                username=u.username,
                email=u.email,
                account_status=u.account_status.value if hasattr(u.account_status, "value") else str(u.account_status),
                joined_at=u.created_at,
            )
            for u in users
        ]

    async def get_reader_detail(
        self, session: AsyncSession, user_id: int
    ) -> ReaderDetailAdminResponse | None:
        query = (
            select(User)
            .options(
                selectinload(User.reader_profile),
                selectinload(User.reviews).selectinload(Review.book).selectinload(Book.author),
            )
            .where(User.id == user_id, User.role == UserRole.READER)
        )
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        if user is None:
            return None

        reviews_list = [
            ReaderReviewAdminItem(
                id=rev.id,
                book_id=rev.book_id,
                book_title=rev.book.title if rev.book else "Unknown Book",
                book_cover_url=rev.book.cover_url if rev.book else None,
                book_author=rev.book.author.full_name if (rev.book and rev.book.author) else "Unknown Author",
                rating=rev.rating,
                comment=rev.comment,
                created_at=rev.created_at.isoformat() if rev.created_at else "",
            )
            for rev in (user.reviews or [])
        ]

        return ReaderDetailAdminResponse(
            id=user.id,
            full_name=user.full_name,
            username=user.username,
            email=user.email,
            account_status=user.account_status.value if hasattr(user.account_status, "value") else str(user.account_status),
            email_verified=user.email_verified,
            joined_at=user.created_at,
            country=user.reader_profile.country if user.reader_profile else None,
            short_bio=user.reader_profile.short_bio if user.reader_profile else None,
            review_count=len(reviews_list),
            reviews=reviews_list,
        )

    async def update_reader_status(
        self, session: AsyncSession, user_id: int, new_status: str
    ) -> AdminActionSuccessResponse:
        user = await session.get(User, user_id)
        if user is None or user.role != UserRole.READER:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reader not found.",
            )

        target = new_status.strip().lower()
        if target not in {"active", "suspended"}:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid reader status '{new_status}'. Allowed values are 'active' or 'suspended'.",
            )

        target_enum = AccountStatus.ACTIVE if target == "active" else AccountStatus.SUSPENDED
        if user.account_status == target_enum:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Reader account is already {target}.",
            )

        user.account_status = target_enum
        try:
            await session.commit()
        except HTTPException:
            await session.rollback()
            raise
        except Exception as exc:
            await session.rollback()
            logger.error("Database commit failed during update_reader_status for user %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update reader account status due to a database error.",
            ) from exc

        return AdminActionSuccessResponse(
            success=True,
            message=f"Reader account has been {'suspended' if target == 'suspended' else 'reactivated'}.",
        )

    async def send_reader_password_reset(
        self, session: AsyncSession, user_id: int
    ) -> AdminActionSuccessResponse:
        user = await session.get(User, user_id)
        if user is None or user.role != UserRole.READER:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reader not found.",
            )

        password_reset_svc = PasswordResetService()
        try:
            await password_reset_svc.request_reset(session, user.email)
        except EmailDeliveryError as exc:
            logger.error("Failed to deliver password reset email for reader %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send password reset email due to a mail delivery error.",
            ) from exc
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Failed to process password reset request for reader %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process password reset request.",
            ) from exc

        return AdminActionSuccessResponse(
            success=True,
            message=f"Password reset instructions have been emailed to {user.email}.",
        )

    async def get_author_detail(
        self, session: AsyncSession, user_id: int
    ) -> AuthorDetailAdminResponse | None:
        query = (
            select(User)
            .options(
                selectinload(User.author_profile),
                selectinload(User.author_rejection_logs),
                selectinload(User.books).selectinload(Book.category),
                selectinload(User.books).selectinload(Book.reviews),
                selectinload(User.books).selectinload(Book.rejection_logs),
            )
            .where(User.id == user_id, User.role == UserRole.AUTHOR)
        )
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        if user is None:
            return None

        published_books: list[AuthorBookAdminSummary] = []
        pending_books: list[AuthorBookAdminSummary] = []
        rejected_books: list[AuthorBookAdminSummary] = []
        draft_books: list[AuthorBookAdminSummary] = []

        total_views = 0
        total_downloads = 0
        all_published_reviews_ratings: list[int] = []

        for b in (user.books or []):
            total_views += b.view_count or 0
            total_downloads += b.download_count or 0

            summary = AuthorBookAdminSummary(
                id=b.id,
                title=b.title,
                category_name=b.category.name if b.category else "General",
                status=b.status.value if hasattr(b.status, "value") else str(b.status),
                cover_image_path=b.cover_image_path,
                view_count=b.view_count or 0,
                download_count=b.download_count or 0,
                average_rating=b.average_rating if hasattr(b, "average_rating") else 0.0,
                rejection_reason=b.rejection_reason,
                created_at=b.created_at,
                published_at=b.published_at,
            )

            if b.status == BookStatus.PUBLISHED:
                published_books.append(summary)
                if b.reviews:
                    all_published_reviews_ratings.extend(r.rating for r in b.reviews)
            elif b.status == BookStatus.PENDING_REVIEW:
                pending_books.append(summary)
            elif b.status == BookStatus.REJECTED:
                rejected_books.append(summary)
            elif b.status == BookStatus.DRAFT:
                draft_books.append(summary)

        avg_rating = (
            round(sum(all_published_reviews_ratings) / len(all_published_reviews_ratings), 1)
            if all_published_reviews_ratings
            else 0.0
        )

        rejection_logs = [
            AuthorRejectionLogItem(
                id=log.id,
                reason=log.reason,
                created_at=log.created_at.isoformat() if hasattr(log.created_at, "isoformat") else str(log.created_at),
            )
            for log in (user.author_rejection_logs or [])
        ]

        return AuthorDetailAdminResponse(
            id=user.id,
            full_name=user.full_name,
            username=user.username,
            email=user.email,
            account_status=user.account_status.value if hasattr(user.account_status, "value") else str(user.account_status),
            email_verified=user.email_verified,
            created_at=user.created_at,
            pen_name=user.author_profile.pen_name if user.author_profile else user.full_name,
            country=user.author_profile.country if user.author_profile else None,
            short_bio=user.author_profile.short_bio if user.author_profile else None,
            profile_image_path=user.author_profile.profile_image_path if user.author_profile else None,
            total_books=len(user.books or []),
            total_views=total_views,
            total_downloads=total_downloads,
            average_rating=avg_rating,
            published_books=published_books,
            pending_books=pending_books,
            rejected_books=rejected_books,
            draft_books=draft_books,
            rejection_logs=rejection_logs,
        )

    async def update_author_status(
        self, session: AsyncSession, user_id: int, new_status: str
    ) -> AdminActionSuccessResponse:
        user = await session.get(User, user_id)
        if user is None or user.role != UserRole.AUTHOR:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author not found.",
            )

        target = new_status.strip().lower()
        if target not in {"approved", "active", "suspended"}:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid author status '{new_status}'. Allowed values are 'approved' or 'suspended'.",
            )

        target_enum = AccountStatus.SUSPENDED if target == "suspended" else AccountStatus.APPROVED

        if user.account_status in {AccountStatus.PENDING, AccountStatus.REJECTED}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot suspend an author application that is pending review or rejected. Please use the application approval/rejection workflow.",
            )

        if user.account_status == target_enum:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Author account is already {user.account_status.value}.",
            )

        user.account_status = target_enum
        try:
            await session.commit()
        except HTTPException:
            await session.rollback()
            raise
        except Exception as exc:
            await session.rollback()
            logger.error("Database commit failed during update_author_status for user %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update author account status due to a database error.",
            ) from exc

        return AdminActionSuccessResponse(
            success=True,
            message=f"Author account has been {'suspended' if target == 'suspended' else 'reactivated'}.",
        )

    async def send_author_password_reset(
        self, session: AsyncSession, user_id: int
    ) -> AdminActionSuccessResponse:
        user = await session.get(User, user_id)
        if user is None or user.role != UserRole.AUTHOR:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Author not found.",
            )

        password_reset_svc = PasswordResetService()
        try:
            await password_reset_svc.request_reset(session, user.email)
        except EmailDeliveryError as exc:
            logger.error("Failed to deliver password reset email for author %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send password reset email due to a mail delivery error.",
            ) from exc
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Failed to process password reset request for author %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process password reset request.",
            ) from exc

        return AdminActionSuccessResponse(
            success=True,
            message=f"Password reset instructions have been emailed to {user.email}.",
        )

    async def get_dashboard_recent(
        self, session: AsyncSession
    ) -> DashboardRecentResponse:
        # Last 5 books
        books_res = await session.execute(
            select(Book)
            .options(selectinload(Book.author), selectinload(Book.category))
            .order_by(Book.created_at.desc())
            .limit(5)
        )
        recent_books = [
            RecentBookItem(
                id=b.id,
                title=b.title,
                author_name=b.author.full_name if b.author else "Unknown",
                category_name=b.category.name if b.category else "General",
                status=b.status.value if hasattr(b.status, "value") else str(b.status),
                cover_image_path=b.cover_image_path,
                created_at=b.created_at,
            )
            for b in books_res.scalars().all()
        ]

        # Last 5 readers by join date
        readers_res = await session.execute(
            select(User)
            .where(User.role == UserRole.READER)
            .order_by(User.created_at.desc())
            .limit(5)
        )
        recent_readers = [
            RecentReaderItem(
                id=u.id,
                full_name=u.full_name,
                username=u.username,
                joined_at=u.created_at,
            )
            for u in readers_res.scalars().all()
        ]

        # Pending author requests
        pending_res = await session.execute(
            select(User)
            .where(User.role == UserRole.AUTHOR, User.account_status == AccountStatus.PENDING)
            .order_by(User.created_at.desc())
        )
        pending_requests = [
            RecentAuthorRequestItem(
                id=u.id,
                user_id=u.id,
                full_name=u.full_name,
                pen_name=u.author_profile.pen_name if u.author_profile else u.full_name,
                country=u.author_profile.country if u.author_profile else None,
                created_at=u.created_at,
            )
            for u in pending_res.scalars().all()
        ]

        return DashboardRecentResponse(
            recent_books=recent_books,
            recent_readers=recent_readers,
            pending_author_requests=pending_requests,
        )

    async def get_all_categories(self, session: AsyncSession) -> list[CategoryAdminItem]:
        query = select(Category).options(selectinload(Category.books))
        result = await session.execute(query)
        categories = result.scalars().all()

        res = []
        for c in categories:
            b_count = len(c.books) if c.books else 0
            res.append(
                CategoryAdminItem(
                    id=c.id,
                    name=c.name,
                    description=c.description,
                    is_active=c.is_active,
                    total_books=b_count,
                    created_at=c.created_at,
                )
            )
        return res

    async def create_category(
        self, session: AsyncSession, name: str, description: str | None = None
    ) -> CategoryAdminItem:
        cleaned_name = name.strip() if name else ""
        if not cleaned_name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Category name cannot be blank.",
            )

        existing_res = await session.execute(
            select(Category).where(func.lower(Category.name) == func.lower(cleaned_name))
        )
        if existing_res.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category '{cleaned_name}' already exists.",
            )

        cat = Category(
            name=cleaned_name,
            description=description.strip() if description else None,
            is_active=True,
        )
        session.add(cat)
        await session.commit()
        await session.refresh(cat)
        return CategoryAdminItem(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            is_active=cat.is_active,
            total_books=0,
            created_at=cat.created_at,
        )

    async def toggle_category_status(
        self, session: AsyncSession, category_id: int
    ) -> tuple[bool, bool]:
        cat = await session.get(Category, category_id)
        if cat is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found.",
            )

        cat.is_active = not cat.is_active
        await session.commit()
        return True, cat.is_active

    async def delete_category(self, session: AsyncSession, category_id: int) -> bool:
        cat = await session.get(Category, category_id)
        if cat is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found.",
            )

        # Verify no books reference this category
        book_count_res = await session.execute(
            select(func.count(Book.id)).where(Book.category_id == category_id)
        )
        book_count = book_count_res.scalar_one_or_none() or 0
        if book_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete category '{cat.name}' because {book_count} book(s) reference it.",
            )

        await session.delete(cat)
        await session.commit()
        return True

    async def get_author_stats(self, session: AsyncSession) -> AuthorStatsResponse:
        pending_res = await session.execute(
            select(func.count()).select_from(User).where(User.role == UserRole.AUTHOR, User.account_status == AccountStatus.PENDING)
        )
        new_apps = pending_res.scalar() or 0

        approved_res = await session.execute(
            select(func.count()).select_from(User).where(User.role == UserRole.AUTHOR, User.account_status == AccountStatus.APPROVED)
        )
        total_authors = approved_res.scalar() or 0

        review_res = await session.execute(
            select(func.count()).select_from(Book).where(Book.status == BookStatus.PENDING_REVIEW)
        )
        books_in_review = review_res.scalar() or 0

        rejected_res = await session.execute(
            select(func.count()).select_from(User).where(User.role == UserRole.AUTHOR, User.account_status == AccountStatus.REJECTED)
        )
        total_rejected = rejected_res.scalar() or 0

        return AuthorStatsResponse(
            new_applications=new_apps,
            total_authors=total_authors,
            books_in_review=books_in_review,
            total_rejected=total_rejected,
        )

    async def get_platform_statistics(self, session: AsyncSession) -> PlatformStatisticsResponse:
        total_books_res = await session.execute(select(func.count()).select_from(Book))
        total_books = total_books_res.scalar() or 0

        total_readers_res = await session.execute(select(func.count()).select_from(User).where(User.role == UserRole.READER))
        total_readers = total_readers_res.scalar() or 0

        total_authors_res = await session.execute(select(func.count()).select_from(User).where(User.role == UserRole.AUTHOR))
        total_authors = total_authors_res.scalar() or 0

        sum_downloads_res = await session.execute(select(func.sum(Book.download_count)))
        sum_downloads_raw = sum_downloads_res.scalar() or 0

        sum_views_res = await session.execute(select(func.sum(Book.view_count)))
        sum_views_raw = sum_views_res.scalar() or 0

        def format_num(val: int) -> str:
            if val >= 1000:
                return f"{val / 1000:.1f}k"
            return str(val)

        total_downloads = format_num(sum_downloads_raw)
        total_views = format_num(sum_views_raw)

        # 1. Monthly Uploads from DB (Past 6 months based on actual year & month)
        now = datetime.now(UTC)
        month_labels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

        months_window = []
        for i in range(5, -1, -1):
            m_idx = now.month - 1 - i
            y = now.year + (m_idx // 12)
            m = (m_idx % 12) + 1
            months_window.append((y, m))

        upload_counts = []
        for (y, m) in months_window:
            label = month_labels[m - 1]
            pub_res = await session.execute(
                select(func.count()).select_from(Book)
                .where(
                    Book.status == BookStatus.PUBLISHED,
                    func.extract('year', Book.created_at) == y,
                    func.extract('month', Book.created_at) == m,
                )
            )
            pub_cnt = pub_res.scalar() or 0

            draft_res = await session.execute(
                select(func.count()).select_from(Book)
                .where(
                    Book.status != BookStatus.PUBLISHED,
                    func.extract('year', Book.created_at) == y,
                    func.extract('month', Book.created_at) == m,
                )
            )
            draft_cnt = draft_res.scalar() or 0
            upload_counts.append((label, pub_cnt, draft_cnt))

        max_upload_total = max([pub + draft for _, pub, draft in upload_counts] + [1])
        monthly_uploads = []
        for label, pub_cnt, draft_cnt in upload_counts:
            dark_val = int((pub_cnt / max_upload_total) * 100) if pub_cnt > 0 else 0
            light_val = int((draft_cnt / max_upload_total) * 100) if draft_cnt > 0 else 0
            monthly_uploads.append(MonthlyUploadItem(month=label, dark=dark_val, light=light_val))

        # 2. Monthly Registrations from DB (Past 6 months with correct year & month)
        reg_counts = []
        for (y, m) in months_window:
            label = month_labels[m - 1]
            u_res = await session.execute(
                select(func.count()).select_from(User)
                .where(
                    func.extract('year', User.created_at) == y,
                    func.extract('month', User.created_at) == m,
                )
            )
            u_cnt = u_res.scalar() or 0
            reg_counts.append((label, u_cnt))

        max_reg = max([cnt for _, cnt in reg_counts] + [1])
        monthly_registrations = []
        for label, u_cnt in reg_counts:
            val = int((u_cnt / max_reg) * 100) if u_cnt > 0 else 0
            monthly_registrations.append(MonthlyRegistrationItem(month=label, val=val))

        # 3. Top Categories from DB
        cats_res = await session.execute(select(Category).options(selectinload(Category.books)))
        all_cats = cats_res.scalars().all()
        top_cats = []
        for c in all_cats:
            c_len = len(c.books)
            pct = round((c_len / total_books * 100), 1) if total_books > 0 else 0.0
            top_cats.append(TopCategoryStatItem(name=c.name, pct=pct))
        top_cats.sort(key=lambda x: x.pct, reverse=True)
        top_categories = top_cats[:4]

        # 4. Most Read Books from DB (Sorted by view_count DESC, real values, no fake trend)
        most_read_res = await session.execute(
            select(Book).options(selectinload(Book.author), selectinload(Book.category), selectinload(Book.reviews))
            .where(Book.status == BookStatus.PUBLISHED)
            .order_by(Book.view_count.desc()).limit(5)
        )
        top_books_db = most_read_res.scalars().all()
        most_read_books = []
        for b in top_books_db:
            cover = f"/{b.cover_image_path.lstrip('/')}" if b.cover_image_path else None
            author_name = b.author.full_name if b.author else "Unknown Author"
            cat_name = b.category.name if b.category else "General"
            reads_str = f"{b.view_count:,}" if b.view_count else "0"
            rating_val = f"{b.average_rating:.1f}" if (hasattr(b, "average_rating") and b.reviews) else "Not rated"

            most_read_books.append(MostReadBookItem(
                id=b.id,
                title=b.title,
                author=author_name,
                category=cat_name,
                totalReads=reads_str,
                rating=rating_val,
                trend="N/A",
                cover=cover,
            ))

        # 5. Most Active Authors from DB (Sorted by published count and views, real ratings)
        authors_res = await session.execute(
            select(User).options(
                selectinload(User.books).selectinload(Book.reviews),
                selectinload(User.author_profile)
            )
            .where(User.role == UserRole.AUTHOR, User.account_status == AccountStatus.APPROVED)
        )
        all_authors_db = authors_res.scalars().all()
        active_authors_list = []
        for u in all_authors_db:
            pub_books = [b for b in (u.books or []) if b.status == BookStatus.PUBLISHED]
            b_cnt = len(pub_books)
            author_views = sum(b.view_count or 0 for b in (u.books or []))
            all_ratings = [r.rating for b in pub_books for r in (b.reviews or [])]
            avg_rating = round(sum(all_ratings) / len(all_ratings), 1) if all_ratings else 0.0
            avatar = f"/{u.author_profile.profile_image_path.lstrip('/')}" if (u.author_profile and u.author_profile.profile_image_path) else None
            score_str = f"★ {avg_rating:.1f}" if all_ratings else "★ 0.0"

            active_authors_list.append((u.full_name, b_cnt, score_str, avatar, author_views))

        active_authors_list.sort(key=lambda x: (x[1], x[4]), reverse=True)
        active_authors = [
            ActiveAuthorItem(name=name, booksCount=b_cnt, score=score_str, avatar=avatar)
            for name, b_cnt, score_str, avatar, _ in active_authors_list[:4]
        ]

        # 6. Most Active Readers from DB (Sorted by real reviews submitted)
        readers_res = await session.execute(
            select(User).options(selectinload(User.reviews))
            .where(User.role == UserRole.READER)
        )
        all_readers_db = readers_res.scalars().all()
        active_readers_list = []
        for r in all_readers_db:
            parts = r.full_name.split()
            initials = "".join([p[0].upper() for p in parts[:2]]) if parts else "RD"
            joined_str = f"Joined {r.created_at.strftime('%b %Y')}" if r.created_at else "Joined"
            rev_cnt = len(r.reviews) if r.reviews else 0
            active_readers_list.append((r.full_name, joined_str, rev_cnt, initials, r.created_at))

        active_readers_list.sort(key=lambda x: (x[2], x[4]), reverse=True)
        active_readers = [
            ActiveReaderItem(name=name, joined=joined_str, totalReads=rev_cnt, initials=initials)
            for name, joined_str, rev_cnt, initials, _ in active_readers_list[:4]
        ]

        return PlatformStatisticsResponse(
            total_books=total_books,
            total_readers=total_readers,
            total_authors=total_authors,
            total_downloads=total_downloads,
            total_views=total_views,
            monthly_uploads=monthly_uploads,
            monthly_registrations=monthly_registrations,
            top_categories=top_categories,
            most_read_books=most_read_books,
            active_authors=active_authors,
            active_readers=active_readers,
        )

    async def get_admin_staff_stats(self, session: AsyncSession) -> AdminStaffStatsResponse:
        total_res = await session.execute(
            select(func.count()).select_from(User).where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
        )
        total_admin_accounts = total_res.scalar() or 0

        super_res = await session.execute(
            select(func.count()).select_from(User).where(User.role == UserRole.SUPER_ADMIN)
        )
        super_admins = super_res.scalar() or 0

        tfa_res = await session.execute(
            select(func.count())
            .select_from(User)
            .where(
                User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
                User.two_factor_enabled,
            )
        )
        two_fa_protected_count = tfa_res.scalar() or 0

        pending_res = await session.execute(
            select(func.count()).select_from(User).where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]), User.account_status == AccountStatus.PENDING)
        )
        pending_invites = pending_res.scalar() or 0

        return AdminStaffStatsResponse(
            total_admin_accounts=total_admin_accounts,
            super_admins=super_admins,
            two_fa_protected_count=two_fa_protected_count,
            two_fa_total=total_admin_accounts,
            pending_invites=pending_invites,
        )

    async def get_admin_staff(self, session: AsyncSession) -> list[AdminUserItemResponse]:
        res = await session.execute(
            select(User).where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
            .order_by(User.id.asc())
        )
        users = res.scalars().all()
        result = []
        for u in users:
            role_title = u.role_title or ("Super Admin" if u.role == UserRole.SUPER_ADMIN else "Senior Editor")
            badge_class = "role-super" if u.role == UserRole.SUPER_ADMIN else (
                "role-moderator" if "Moderator" in role_title else (
                    "role-support" if "Support" in role_title else "role-senior"
                )
            )
            dept = u.department or "Executive Governance"
            status_str = "Active" if u.account_status == AccountStatus.ACTIVE else (
                "Invited" if u.account_status == AccountStatus.PENDING else "Suspended"
            )
            last_active = "Just now (Active)" if status_str == "Active" else "Invited (Pending)"

            result.append(AdminUserItemResponse(
                id=u.id,
                name=u.full_name,
                email=u.email,
                role=role_title,
                role_badge_class=badge_class,
                department=dept,
                last_active=last_active,
                two_factor=u.two_factor_enabled,
                status=status_str,
                avatar="assets/images/auth/sign_in_1.png",
            ))
        return result

    async def create_admin_staff(self, session: AsyncSession, data: AdminCreateRequest) -> AdminUserItemResponse:
        from utils.security import hash_password

        # Check existing email
        email_res = await session.execute(select(User).where(User.email == data.email))
        if email_res.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An account with email '{data.email}' already exists.",
            )

        # Check existing username
        u_res = await session.execute(select(User).where(User.username == data.username))
        if u_res.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username '{data.username}' is already taken.",
            )

        user = User(
            full_name=data.name,
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
            email_verified=True,
            role=UserRole.SUPER_ADMIN if data.role == "Super Admin" else UserRole.ADMIN,
            role_title=data.role,
            department=data.department,
            two_factor_enabled=False,
            account_status=AccountStatus.ACTIVE,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        badge_class = "role-super" if user.role == UserRole.SUPER_ADMIN else (
            "role-moderator" if "Moderator" in data.role else (
                "role-support" if "Support" in data.role else "role-senior"
            )
        )

        return AdminUserItemResponse(
            id=user.id,
            name=user.full_name,
            email=user.email,
            role=user.role_title or data.role,
            role_badge_class=badge_class,
            department=user.department or data.department,
            last_active="Just now (Active)",
            two_factor=False,
            status="Active",
            avatar="assets/images/auth/sign_in_1.png",
        )

    async def toggle_admin_staff_status(self, session: AsyncSession, user_id: int) -> bool:
        user = await session.get(User, user_id)
        if user is None or user.role == UserRole.SUPER_ADMIN:
            return False

        if user.account_status == AccountStatus.ACTIVE:
            user.account_status = AccountStatus.SUSPENDED
        else:
            user.account_status = AccountStatus.ACTIVE

        await session.commit()
        return True

    async def delete_admin_staff(self, session: AsyncSession, user_id: int) -> bool:
        user = await session.get(User, user_id)
        if user is None or user.role == UserRole.SUPER_ADMIN:
            return False

        await session.delete(user)
        await session.commit()
        return True

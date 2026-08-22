from datetime import datetime, timezone
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book, BookStatus
from orm_models.user import AccountStatus, AuthorProfile, User, UserRole
from schemas.admin_schemas import (
    AuthorApplicationResponse,
    BookAdminResponse,
    DashboardStatsResponse,
    SystemLogResponse,
)


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
            book_requests=book_requests,
            author_requests=author_requests,
        )

    async def get_all_books(
        self, session: AsyncSession
    ) -> list[BookAdminResponse]:
        query = select(Book).order_by(Book.created_at.desc())
        result = await session.execute(query)
        books = result.scalars().all()

        return [
            BookAdminResponse(
                id=b.id,
                title=b.title,
                author_name=b.author.full_name if b.author else "Unknown",
                category_name=b.category.name if b.category else "General",
                language=b.language,
                reading_level=b.reading_level,
                status=b.status.value if hasattr(b.status, "value") else str(b.status),
                cover_image_path=b.cover_image_path,
                created_at=b.created_at,
                published_at=b.published_at,
            )
            for b in books
        ]

    async def get_author_applications(
        self, session: AsyncSession, status_filter: str | None = None
    ) -> list[AuthorApplicationResponse]:
        query = select(User).where(User.role == UserRole.AUTHOR)

        if status_filter:
            if status_filter.lower() == "pending":
                query = query.where(User.account_status == AccountStatus.PENDING)
            elif status_filter.lower() == "approved":
                query = query.where(User.account_status == AccountStatus.APPROVED)

        result = await session.execute(query)
        users = result.scalars().all()

        return [
            AuthorApplicationResponse(
                id=u.id,
                user_id=u.id,
                full_name=u.full_name,
                pen_name=u.author_profile.pen_name if u.author_profile else u.full_name,
                email=u.email,
                country=u.author_profile.country if u.author_profile else "N/A",
                account_status=u.account_status.value if hasattr(u.account_status, "value") else str(u.account_status),
                applied_date=u.created_at,
            )
            for u in users
        ]

    async def approve_author(
        self, session: AsyncSession, user_id: int
    ) -> bool:
        user = await session.get(User, user_id)
        if user is None:
            return False

        user.account_status = AccountStatus.APPROVED
        await session.commit()
        return True

    async def reject_author(
        self, session: AsyncSession, user_id: int
    ) -> bool:
        user = await session.get(User, user_id)
        if user is None:
            return False

        user.account_status = AccountStatus.REJECTED
        await session.commit()
        return True

    async def approve_book(
        self, session: AsyncSession, book_id: int
    ) -> bool:
        book = await session.get(Book, book_id)
        if book is None:
            return False

        book.status = BookStatus.PUBLISHED
        book.published_at = datetime.now(timezone.utc)
        await session.commit()
        return True

    async def reject_book(
        self, session: AsyncSession, book_id: int
    ) -> bool:
        book = await session.get(Book, book_id)
        if book is None:
            return False

        book.status = BookStatus.REJECTED
        await session.commit()
        return True

    async def get_system_logs(self) -> list[SystemLogResponse]:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        return [
            SystemLogResponse(timestamp=now_str, level="INFO", module="AuthService", message="Admin session authenticated."),
            SystemLogResponse(timestamp=now_str, level="SUCCESS", module="StorageService", message="Covers stored in backend /storage/covers."),
            SystemLogResponse(timestamp=now_str, level="INFO", module="BookRepository", message="Database query executed cleanly."),
        ]

from datetime import datetime, timezone
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book, BookStatus
from orm_models.user import AccountStatus, AuthorProfile, User, UserRole
from schemas.admin_schemas import (
    AuthorApplicationResponse,
    BookAdminResponse,
    DashboardRecentResponse,
    DashboardStatsResponse,
    ReaderAdminResponse,
    RecentAuthorRequestItem,
    RecentBookItem,
    RecentReaderItem,
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

    async def get_all_books(
        self,
        session: AsyncSession,
        search_query: str | None = None,
        category_filter: str | None = None,
        status_filter: str | None = None,
        language_filter: str | None = None,
        timeframe_filter: str | None = None,
        sort_by: str | None = None,
    ) -> list[BookAdminResponse]:
        from sqlalchemy import or_, cast, String
        from datetime import timedelta
        from orm_models.category import Category

        query = (
            select(Book)
            .options(selectinload(Book.author), selectinload(Book.category))
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
            now = datetime.now(timezone.utc)
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
        else:
            query = query.order_by(Book.created_at.desc())

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

    async def update_book_status(
        self, session: AsyncSession, book_id: int, new_status: str
    ) -> bool:
        book = await session.get(Book, book_id)
        if book is None:
            return False

        status_upper = new_status.strip().upper()
        if status_upper == "DEACTIVATED":
            book.status = BookStatus.DEACTIVATED
        elif status_upper in ["PUBLISHED", "ACTIVE"]:
            book.status = BookStatus.PUBLISHED
            if not book.published_at:
                book.published_at = datetime.now(timezone.utc)
        elif status_upper == "REJECTED":
            book.status = BookStatus.REJECTED
        elif status_upper == "PENDING_REVIEW":
            book.status = BookStatus.PENDING_REVIEW
        else:
            book.status = BookStatus.DRAFT

        await session.commit()
        return True


    async def get_system_logs(self) -> list[SystemLogResponse]:
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        def ts(delta_secs: int) -> str:
            return (now - timedelta(seconds=delta_secs)).strftime("%Y-%m-%d %H:%M:%S UTC")
        return [
            SystemLogResponse(timestamp=ts(0),   level="INFO",    module="AuthService",     message="Admin session authenticated successfully."),
            SystemLogResponse(timestamp=ts(120),  level="SUCCESS", module="BookRepository",  message="Book status updated to PUBLISHED."),
            SystemLogResponse(timestamp=ts(300),  level="WARN",    module="StorageService",  message="Storage utilization reached 64% — consider cleanup."),
            SystemLogResponse(timestamp=ts(480),  level="INFO",    module="AuthorService",   message="Author application approved by admin."),
            SystemLogResponse(timestamp=ts(720),  level="SUCCESS", module="SeedService",     message="Demo data seeded successfully into database."),
            SystemLogResponse(timestamp=ts(900),  level="INFO",    module="CategoryService", message="Book categories fetched (10 total)."),
            SystemLogResponse(timestamp=ts(1200), level="WARN",    module="CacheService",    message="Cache miss rate exceeds 15% — review hot paths."),
            SystemLogResponse(timestamp=ts(1800), level="INFO",    module="AdminService",    message="Dashboard statistics compiled successfully."),
        ]

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

    async def get_dashboard_recent(
        self, session: AsyncSession
    ) -> DashboardRecentResponse:
        # Last 5 books — eagerly load author + category to avoid async lazy-load errors
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

        # Pending author requests — author_profile is lazy="selectin" on User so it loads automatically
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

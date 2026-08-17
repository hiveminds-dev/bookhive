from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import Book
from repositories.author_repository import AuthorRepository
from repositories.user_repository import UserRepository
from repositories.book_repository import BookRepository
from repositories.review_repository import ReviewRepository
from schemas.author import AuthorRegistrationRequest, AuthorRegistrationResponse, AuthorDashboardResponse, DashboardStatsSchema, RecentBookSchema, RecentReviewSchema


class AuthorService:
    def __init__(self):
        self.author_repository = AuthorRepository()
        self.user_repository = UserRepository()
        self.book_repository = BookRepository()
        self.review_repository = ReviewRepository()

    async def create_author(
        self,
        session: AsyncSession,
        author_data: AuthorRegistrationRequest,
    ) -> AuthorRegistrationResponse:
        existing_email = await self.user_repository.get_by_email(
            session,
            author_data.email,
        )

        if existing_email:
            raise ValueError("Email address is already registered")

        existing_username = await self.user_repository.get_by_username(
            session,
            author_data.username,
        )

        if existing_username:
            raise ValueError("Username is already registered")

        try:
            user = await self.user_repository.create_author_user(
                session,
                author_data,
            )

            author = await self.author_repository.create(
                session,
                user.id,
                author_data,
            )

            await session.commit()
            await session.refresh(author)

            return AuthorRegistrationResponse(
                id=user.id,
                author_profile_id=author.id,
                full_name=user.full_name,
                username=user.username,
                email=user.email,
                role=user.role,
                account_status=user.account_status,
                email_verified=user.email_verified,
                pen_name=author.pen_name,
                country=author.country or "",
                preferred_language=author.preferred_language or "",
                short_bio=author.short_bio or "",
                profile_image_path=author.profile_image_path,
                created_at=user.created_at,
            )

        except Exception:
            await session.rollback()
            raise

# New Dashboard Method

    async def get_dashboard_data(
        self,
            session: AsyncSession,
            author_id: int
    ) -> AuthorDashboardResponse:

        user = await self.user_repository.get_by_id(session, author_id)
        if not user:
            raise ValueError("Author not found")

        stats_data = await self.book_repository.get_author_stats(session, author_id)

        stats = DashboardStatsSchema(
            total_books=stats_data.get("total_books", 0),
            published_books=stats_data.get("published_books", 0),
            pending_approval=stats_data.get("pending_approval", 0),
            total_downloads=0
        )

        recent_books_orm = await self.book_repository.get_recent_uploads(session, author_id, limit=2)
        recent_uploads = [
            RecentBookSchema(
                id=book.id,
                title=book.title,
                status=book.status,
                uploaded_at=book.created_at
            ) for book in recent_books_orm
        ]

        recent_reviews_orm = await self.review_repository.get_recent_reviews_for_author(session, author_id, limit=2)
        recent_reviews = [
            RecentReviewSchema(
                reviewer_name=review.reviewer_name,
                rating=review.rating,
                review_text=review.review_text,
                created_at=review.created_at
            ) for review in recent_reviews_orm
        ]

        return AuthorDashboardResponse(
            author_name=user.full_name,
            stats=stats,
            recent_uploads=recent_uploads,
            recent_reviews=recent_reviews
        )
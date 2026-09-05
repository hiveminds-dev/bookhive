from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.book import BookStatus
from orm_models.user import User
from repositories.author_repository import AuthorRepository
from repositories.book_repository import BookRepository
from repositories.user_repository import UserRepository
from schemas.author import (
    AuthorDashboardResponse,
    AuthorRegistrationRequest,
    AuthorRegistrationResponse,
    AuthorSummarySchema,
    DashboardStatsSchema,
    RecentBookSchema,
)
from services.email_verification_service import EmailVerificationService


class AuthorService:
    def __init__(self):
        self.author_repository = AuthorRepository()
        self.user_repository = UserRepository()
        self.book_repository = BookRepository()
        self.email_verification_service = EmailVerificationService()

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

            verification_token = await self.email_verification_service.create_token(
                session,
                user,
            )

            await session.commit()
            await session.refresh(author)

            await self.email_verification_service.send_token_after_registration(
                user.email,
                verification_token,
            )

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

    async def get_dashboard_data(
        self,
        session: AsyncSession,
        author: User,
    ) -> AuthorDashboardResponse:
        status_counts = await self.book_repository.get_author_status_counts(
            session,
            author.id,
        )
        recent_books = await self.book_repository.get_recent_author_books(
            session,
            author.id,
            limit=5,
        )

        draft_books = status_counts.get(BookStatus.DRAFT, 0)
        pending_books = status_counts.get(BookStatus.PENDING_REVIEW, 0)
        published_books = status_counts.get(BookStatus.PUBLISHED, 0)
        rejected_books = status_counts.get(BookStatus.REJECTED, 0)

        return AuthorDashboardResponse(
            author=AuthorSummarySchema(
                id=author.id,
                full_name=author.full_name,
                pen_name=author.author_profile.pen_name if author.author_profile else None,
                account_status=author.account_status,
            ),
            stats=DashboardStatsSchema(
                total_books=sum(status_counts.values()),
                draft_books=draft_books,
                pending_review_books=pending_books,
                published_books=published_books,
                rejected_books=rejected_books,
            ),
            recent_submissions=[
                RecentBookSchema(
                    id=book.id,
                    title=book.title,
                    status=book.status,
                    updated_at=book.updated_at,
                )
                for book in recent_books
            ],
        )

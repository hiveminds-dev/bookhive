import logging

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from orm_models.category import Category
from orm_models.user import AccountStatus, User, UserRole
from utils.security import hash_password

logger = logging.getLogger(__name__)


DEFAULT_CATEGORIES: tuple[tuple[str, str], ...] = (
    (
        "Fiction",
        "Novels, short stories, and other fictional works.",
    ),
    (
        "Non-Fiction",
        "Books based on facts, real events, and real people.",
    ),
    (
        "Technology",
        "Books about technology and digital systems.",
    ),
    (
        "Programming",
        "Software development and programming books.",
    ),
    (
        "Science",
        "Books covering scientific subjects and discoveries.",
    ),
    (
        "Business",
        "Business, entrepreneurship, and management books.",
    ),
    (
        "Design",
        "Books about visual, product, and creative design.",
    ),
    (
        "Personal Growth",
        "Self-development and personal improvement books.",
    ),
    (
        "History",
        "Books about historical periods, people, and events.",
    ),
    (
        "Philosophy",
        "Books about philosophy, reasoning, and ethics.",
    ),
)


async def get_user_by_email(
    session: AsyncSession,
    email: str,
) -> User | None:
    result = await session.execute(
        select(User).where(
            func.lower(User.email) == email.strip().lower(),
        )
    )

    return result.scalar_one_or_none()


async def get_category_by_name(
    session: AsyncSession,
    name: str,
) -> Category | None:
    result = await session.execute(
        select(Category).where(
            func.lower(Category.name) == name.strip().lower(),
        )
    )

    return result.scalar_one_or_none()


def validate_initial_admin_settings() -> None:
    email = settings.initial_admin_email.strip()
    password = settings.initial_admin_password

    if not email:
        raise RuntimeError(
            "INITIAL_ADMIN_EMAIL must be provided when database "
            "seeding is enabled."
        )

    if not password or password == "change_me":
        raise RuntimeError(
            "Set a secure INITIAL_ADMIN_PASSWORD in the .env file "
            "before starting the application."
        )

    if len(password) < 8:
        raise RuntimeError(
            "INITIAL_ADMIN_PASSWORD must contain at least 8 characters."
        )


async def seed_initial_admin(session: AsyncSession) -> None:
    validate_initial_admin_settings()

    email = settings.initial_admin_email.strip().lower()

    existing_user = await get_user_by_email(
        session=session,
        email=email,
    )

    if existing_user is not None:
        logger.info(
            "Initial administrator was not created because the email "
            "%s already exists.",
            email,
        )
        return

    admin = User(
        full_name=settings.initial_admin_full_name.strip(),
        email=email,
        password_hash=hash_password(
            settings.initial_admin_password,
        ),
        email_verified=True,
        role=UserRole.ADMIN,
        account_status=AccountStatus.ACTIVE,
    )

    session.add(admin)
    await session.flush()

    logger.info(
        "Initial BookHive administrator account was created for %s.",
        email,
    )


async def seed_default_categories(session: AsyncSession) -> None:
    for name, description in DEFAULT_CATEGORIES:
        existing_category = await get_category_by_name(
            session=session,
            name=name,
        )

        if existing_category is not None:
            continue

        session.add(
            Category(
                name=name,
                description=description,
                is_active=True,
            )
        )

        await session.flush()

        logger.info(
            "Default category '%s' was created.",
            name,
        )


async def seed_demo_records(session: AsyncSession) -> None:
    """
    Add optional development-only sample data here.

    Real demo readers, authors, books, and reviews can be added after
    those modules and their final database fields are completed.
    """

    if settings.app_env.lower() != "development":
        logger.warning(
            "Demo data seeding was skipped because APP_ENV is not "
            "development."
        )
        return

    logger.info(
        "Demo data seeding is enabled, but no demo records are "
        "currently configured."
    )


async def seed_database(session: AsyncSession) -> None:
    """
    Seed required BookHive records without creating duplicates.
    """

    try:
        await seed_initial_admin(session)
        await seed_default_categories(session)

        if settings.seed_demo_data:
            await seed_demo_records(session)

        await session.commit()

        logger.info("BookHive database seeding completed.")

    except IntegrityError:
        await session.rollback()

        logger.exception(
            "Database seeding failed because a duplicate or invalid "
            "record was detected."
        )

        raise

    except Exception:
        await session.rollback()

        logger.exception("BookHive database seeding failed.")

        raise

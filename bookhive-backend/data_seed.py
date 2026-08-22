import logging
import re

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


async def get_user_by_username(
    session: AsyncSession,
    username: str,
) -> User | None:
    result = await session.execute(
        select(User).where(
            func.lower(User.username) == username.strip().lower(),
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


def validate_initial_user_settings(
    *,
    full_name: str,
    username: str,
    email: str,
    password: str,
    env_prefix: str,
) -> None:
    full_name = full_name.strip()
    username = username.strip()
    email = email.strip()

    if len(full_name) < 2:
        raise RuntimeError(
            f"{env_prefix}_FULL_NAME must contain at least 2 characters."
        )

    if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]{2,49}", username):
        raise RuntimeError(
            f"{env_prefix}_USERNAME must start with a letter and contain "
            "3 to 50 letters, numbers, or underscores."
        )

    if not email:
        raise RuntimeError(
            f"{env_prefix}_EMAIL must be provided when database "
            "seeding is enabled."
        )

    if not password or password in {
        "change_me",
        "password",
        "replace_with_a_secure_password",
    }:
        raise RuntimeError(
            f"Set a secure {env_prefix}_PASSWORD in the .env file "
            "before starting the application."
        )

    if len(password) < 8:
        raise RuntimeError(
            f"{env_prefix}_PASSWORD must contain at least 8 characters."
        )


def validate_initial_admin_settings() -> None:
    validate_initial_user_settings(
        full_name=settings.initial_admin_full_name,
        username=settings.initial_admin_username,
        email=settings.initial_admin_email,
        password=settings.initial_admin_password,
        env_prefix="INITIAL_ADMIN",
    )


def validate_initial_super_admin_settings() -> None:
    validate_initial_user_settings(
        full_name=settings.initial_super_admin_full_name,
        username=settings.initial_super_admin_username,
        email=settings.initial_super_admin_email,
        password=settings.initial_super_admin_password,
        env_prefix="INITIAL_SUPER_ADMIN",
    )


async def seed_initial_user(
    *,
    session: AsyncSession,
    full_name: str,
    username: str,
    email: str,
    password: str,
    role: UserRole,
    env_prefix: str,
    label: str,
) -> None:
    validate_initial_user_settings(
        full_name=full_name,
        username=username,
        email=email,
        password=password,
        env_prefix=env_prefix,
    )

    email = email.strip().lower()
    username = username.strip().lower()

    existing_user = await get_user_by_email(
        session=session,
        email=email,
    )

    if existing_user is not None:
        if existing_user.role != role:
            raise RuntimeError(
                f"{env_prefix}_EMAIL already belongs to a non-{role.value} user."
            )

        logger.info(
            "Initial %s already exists for %s.",
            label,
            email,
        )
        return

    existing_username = await get_user_by_username(
        session=session,
        username=username,
    )

    if existing_username is not None:
        raise RuntimeError(
            f"{env_prefix}_USERNAME already belongs to another user."
        )

    user = User(
        full_name=full_name.strip(),
        username=username,
        email=email,
        password_hash=hash_password(
            password,
        ),
        email_verified=True,
        role=role,
        account_status=AccountStatus.ACTIVE,
    )

    session.add(user)
    await session.flush()

    logger.info(
        "Initial BookHive %s account was created for %s.",
        label,
        email,
    )


async def seed_initial_admin(session: AsyncSession) -> None:
    await seed_initial_user(
        session=session,
        full_name=settings.initial_admin_full_name,
        username=settings.initial_admin_username,
        email=settings.initial_admin_email,
        password=settings.initial_admin_password,
        role=UserRole.ADMIN,
        env_prefix="INITIAL_ADMIN",
        label="administrator",
    )


async def seed_initial_super_admin(session: AsyncSession) -> None:
    await seed_initial_user(
        session=session,
        full_name=settings.initial_super_admin_full_name,
        username=settings.initial_super_admin_username,
        email=settings.initial_super_admin_email,
        password=settings.initial_super_admin_password,
        role=UserRole.SUPER_ADMIN,
        env_prefix="INITIAL_SUPER_ADMIN",
        label="super administrator",
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
    """Add development demo authors, readers, and sample books with cover images."""
    if settings.app_env.lower() != "development":
        return

    from orm_models.book import Book, BookStatus
    from orm_models.user import AuthorProfile

    # Demo Author 1: Eleanor Vance
    eleanor = await get_user_by_email(session, "eleanor.v@lumina.com")
    if eleanor is None:
        eleanor = User(
            full_name="Eleanor Vance",
            username="eleanorv",
            email="eleanor.v@lumina.com",
            password_hash=hash_password("Password123!"),
            email_verified=True,
            role=UserRole.AUTHOR,
            account_status=AccountStatus.APPROVED,
        )
        session.add(eleanor)
        await session.flush()
        session.add(
            AuthorProfile(
                user_id=eleanor.id,
                pen_name="E. V. Sterling",
                country="United Kingdom",
                short_bio="Author of classical and dark philosophy literature.",
            )
        )
        await session.flush()

    # Demo Author 2: Dr. Sarah Chen
    sarah = await get_user_by_email(session, "sarah.chen@writes.org")
    if sarah is None:
        sarah = User(
            full_name="Dr. Sarah Chen",
            username="sarahchen",
            email="sarah.chen@writes.org",
            password_hash=hash_password("Password123!"),
            email_verified=True,
            role=UserRole.AUTHOR,
            account_status=AccountStatus.APPROVED,
        )
        session.add(sarah)
        await session.flush()
        session.add(
            AuthorProfile(
                user_id=sarah.id,
                pen_name="Dr. Sarah Chen",
                country="Canada",
                short_bio="Quantum physics researcher and science author.",
            )
        )
        await session.flush()

    # Demo Pending Author: Julian Thorne
    julian = await get_user_by_email(session, "j.thorne@writes.org")
    if julian is None:
        julian = User(
            full_name="Julian Thorne",
            username="jthorne",
            email="j.thorne@writes.org",
            password_hash=hash_password("Password123!"),
            email_verified=True,
            role=UserRole.AUTHOR,
            account_status=AccountStatus.PENDING,
        )
        session.add(julian)
        await session.flush()
        session.add(
            AuthorProfile(
                user_id=julian.id,
                pen_name="J. Thistle",
                country="Canada",
                short_bio="Aspiring novelist submitting new work.",
            )
        )
        await session.flush()

    # Categories
    philosophy = await get_category_by_name(session, "Philosophy")
    science = await get_category_by_name(session, "Science")
    fiction = await get_category_by_name(session, "Fiction")

    # Sample Books
    book1_result = await session.execute(select(Book).where(Book.title == "Beyond Good and Evil"))
    if book1_result.scalar_one_or_none() is None and philosophy and eleanor:
        session.add(
            Book(
                title="Beyond Good and Evil",
                author_id=eleanor.id,
                category_id=philosophy.id,
                description="A prelude to a philosophy of the future.",
                language="English",
                reading_level="Advanced",
                cover_image_path="storage/covers/beyond-good-and-evil.jpg",
                status=BookStatus.PUBLISHED,
            )
        )

    book2_result = await session.execute(select(Book).where(Book.title == "Quantum Mechanics"))
    if book2_result.scalar_one_or_none() is None and science and sarah:
        session.add(
            Book(
                title="Quantum Mechanics",
                author_id=sarah.id,
                category_id=science.id,
                description="Explore quantum states, wave equations, and modern particle physics.",
                language="English",
                reading_level="Intermediate",
                cover_image_path="storage/covers/quantum-mechanics.jpg",
                status=BookStatus.PENDING_REVIEW,
            )
        )

    book3_result = await session.execute(select(Book).where(Book.title == "The Silent Grove"))
    if book3_result.scalar_one_or_none() is None and fiction and eleanor:
        session.add(
            Book(
                title="The Silent Grove",
                author_id=eleanor.id,
                category_id=fiction.id,
                description="A mystery novel set in ancient misty pine forests.",
                language="Spanish",
                reading_level="Beginner",
                cover_image_path="storage/covers/the-silent-grove.jpg",
                status=BookStatus.DRAFT,
            )
        )

    await session.flush()
    logger.info("Demo authors and books with cover images seeded successfully.")


async def seed_database(session: AsyncSession) -> None:
    """
    Seed required BookHive records without creating duplicates.
    """

    try:
        await seed_initial_admin(session)
        await seed_initial_super_admin(session)
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

import logging
import os
import re
import shutil

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from orm_models.book import Book, BookStatus
from orm_models.category import Category
from orm_models.user import AccountStatus, User, UserRole
from utils.security import hash_password

logger = logging.getLogger(__name__)


def assign_seed_pdf_for_book(book_index: int) -> tuple[str, int]:
    """Ensures each book index gets a unique PDF file in storage/books/ (copying sample PDFs if needed). Returns (pdf_path, page_count)."""
    base_dir = os.path.join(os.path.dirname(__file__), "storage", "books")
    os.makedirs(base_dir, exist_ok=True)

    target_filename = f"book_{book_index}.pdf"
    target_path = os.path.join(base_dir, target_filename)

    sample_index = ((book_index - 1) % 11) + 1
    sample_filename = f"sample{sample_index}.pdf"
    sample_path = os.path.join(base_dir, sample_filename)

    if not os.path.exists(target_path):
        if os.path.exists(sample_path):
            shutil.copyfile(sample_path, target_path)
            logger.info(f"Copied {sample_filename} to {target_filename} for book #{book_index}")

    page_count = 6
    if os.path.exists(target_path):
        try:
            with open(target_path, "rb") as f:
                content = f.read()
            matches = re.findall(rb'/Type\s*/Page\b', content)
            if matches:
                page_count = len(matches)
        except Exception as e:
            logger.warning(f"Error reading PDF page count for {target_path}: {e}")

    return f"storage/books/{target_filename}", page_count


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
    """Add rich development demo data: readers, authors (approved/pending/rejected), and books."""
    if settings.app_env.lower() != "development":
        return

    from datetime import datetime, timezone, timedelta

    from orm_models.book import Book, BookStatus
    from orm_models.user import AuthorProfile

    # ===========================================================================
    # DEMO READERS (8 active readers)
    # ===========================================================================

    _readers_data = [
        ("Liam Henderson", "liamh", "liam.henderson@mail.com", "United States"),
        ("Sarah Jenkins", "sarahj", "sarah.jenkins@mail.com", "Australia"),
        ("Marcus Webb", "marcusw", "marcus.webb@mail.com", "United Kingdom"),
        ("Diana Ross", "dianar", "diana.ross@mail.com", "Canada"),
        ("Amara Osei", "amaraos", "amara.osei@mail.com", "Ghana"),
        ("Felix Müller", "felixm", "felix.muller@mail.com", "Germany"),
        ("Priya Nair", "priyan", "priya.nair@mail.com", "India"),
        ("Carlos Reyes", "carlosr", "carlos.reyes@mail.com", "Mexico"),
    ]

    for full_name, username, email, _country in _readers_data:
        existing = await get_user_by_email(session, email)
        if existing is None:
            session.add(User(
                full_name=full_name,
                username=username,
                email=email,
                password_hash=hash_password("Password123!"),
                email_verified=True,
                role=UserRole.READER,
                account_status=AccountStatus.ACTIVE,
            ))
    await session.flush()

    # ===========================================================================
    # DEMO AUTHORS — APPROVED (5)
    # ===========================================================================

    _approved_authors = [
        ("Eleanor Vance", "eleanorv", "eleanor.v@lumina.com",
         "E. V. Sterling", "United Kingdom", "English",
         "Author of classical and dark philosophy literature."),
        ("Dr. Sarah Chen", "sarahchen", "sarah.chen@writes.org",
         "Dr. Sarah Chen", "Canada", "English",
         "Quantum physics researcher and science author."),
        ("Amir Hassan", "amirh", "amir.hassan@authorhub.com",
         "A. Hassan", "Egypt", "Arabic",
         "Bestselling novelist exploring Middle-Eastern historical fiction."),
        ("Yuki Tanaka", "yukit", "yuki.tanaka@writes.jp",
         "Y. T. Bloom", "Japan", "Japanese",
         "Technology author and software architect from Tokyo."),
        ("Isabella Rossi", "isabellaro", "i.rossi@literario.it",
         "Bella R.", "Italy", "Italian",
         "Award-winning author of contemporary European fiction."),
    ]

    author_users: dict[str, User] = {}
    for full_name, username, email, pen_name, country, language, bio in _approved_authors:
        user = await get_user_by_email(session, email)
        if user is None:
            user = User(
                full_name=full_name,
                username=username,
                email=email,
                password_hash=hash_password("Password123!"),
                email_verified=True,
                role=UserRole.AUTHOR,
                account_status=AccountStatus.APPROVED,
            )
            session.add(user)
            await session.flush()
            session.add(AuthorProfile(
                user_id=user.id,
                pen_name=pen_name,
                country=country,
                preferred_language=language,
                short_bio=bio,
            ))
            await session.flush()
        author_users[email] = user

    # ===========================================================================
    # DEMO AUTHORS — PENDING (4 waiting for approval)
    # ===========================================================================

    _pending_authors = [
        ("Julian Thorne", "jthorne", "j.thorne@writes.org",
         "J. Thistle", "Canada", "Aspiring novelist submitting new work."),
        ("Noah Adeyemi", "noaha", "noah.adeyemi@writes.ng",
         "N. Adeyemi", "Nigeria", "Debut author covering African contemporary stories."),
        ("Mei Lin", "meilin", "mei.lin@authorstudio.cn",
         "Mei L.", "China", "Aspiring science fiction writer with three manuscripts ready."),
        ("Tariq Khalid", "tariqk", "tariq.khalid@writes.ae",
         "T. Khalid", "UAE", "Philosophy and self-development author seeking approval."),
    ]

    for full_name, username, email, pen_name, country, bio in _pending_authors:
        user = await get_user_by_email(session, email)
        if user is None:
            user = User(
                full_name=full_name,
                username=username,
                email=email,
                password_hash=hash_password("Password123!"),
                email_verified=True,
                role=UserRole.AUTHOR,
                account_status=AccountStatus.PENDING,
            )
            session.add(user)
            await session.flush()
            session.add(AuthorProfile(
                user_id=user.id,
                pen_name=pen_name,
                country=country,
                short_bio=bio,
            ))
            await session.flush()
        author_users[email] = user

    # ===========================================================================
    # DEMO AUTHORS — REJECTED (2)
    # ===========================================================================

    _rejected_authors = [
        ("Viktor Petrov", "viktorp", "viktor.petrov@mail.ru",
         "V. Petrov", "Russia", "Rejected due to incomplete manuscript submission."),
        ("Fatima Al-Zahra", "fatimaz", "fatima.alzahra@writes.ma",
         "F. Al-Zahra", "Morocco", "Rejected — duplicate submission under different account."),
    ]

    for full_name, username, email, pen_name, country, bio in _rejected_authors:
        user = await get_user_by_email(session, email)
        if user is None:
            user = User(
                full_name=full_name,
                username=username,
                email=email,
                password_hash=hash_password("Password123!"),
                email_verified=True,
                role=UserRole.AUTHOR,
                account_status=AccountStatus.REJECTED,
            )
            session.add(user)
            await session.flush()
            session.add(AuthorProfile(
                user_id=user.id,
                pen_name=pen_name,
                country=country,
                short_bio=bio,
            ))
            await session.flush()

    # ===========================================================================
    # FETCH ALL CATEGORIES
    # ===========================================================================

    fiction = await get_category_by_name(session, "Fiction")
    non_fiction = await get_category_by_name(session, "Non-Fiction")
    technology = await get_category_by_name(session, "Technology")
    programming = await get_category_by_name(session, "Programming")
    science = await get_category_by_name(session, "Science")
    business = await get_category_by_name(session, "Business")
    design = await get_category_by_name(session, "Design")
    personal_growth = await get_category_by_name(session, "Personal Growth")
    history = await get_category_by_name(session, "History")
    philosophy = await get_category_by_name(session, "Philosophy")

    # Convenience: author lookup by email
    def _author(email: str) -> User | None:
        return author_users.get(email)

    book_counter = 0

    # ===========================================================================
    # BOOKS — PUBLISHED (8)
    # ===========================================================================

    _published_books = [
        ("Beyond Good and Evil",
         "eleanor.v@lumina.com", philosophy,
         "A prelude to a philosophy of the future. Nietzsche challenges the foundations of morality.",
         "English", "Advanced", "storage/covers/beyond-good-and-evil.jpg"),
        ("The Forgotten Empire",
         "amir.hassan@authorhub.com", history,
         "A sweeping historical fiction set in the height of the Ottoman Empire.",
         "English", "Intermediate", None),
        ("Silicon Dreams",
         "yuki.tanaka@writes.jp", technology,
         "An insider's guide to how modern technology companies build and scale products.",
         "English", "Intermediate", None),
        ("The Art of Stillness",
         "i.rossi@literario.it", personal_growth,
         "A practical guide to mindfulness, focus, and finding calm in a chaotic world.",
         "English", "Beginner", None),
        ("Clean Architecture in Python",
         "yuki.tanaka@writes.jp", programming,
         "Practical patterns and principles for writing maintainable Python applications.",
         "English", "Advanced", None),
        ("Echoes of Tomorrow",
         "i.rossi@literario.it", fiction,
         "A near-future science fiction novel exploring human identity and artificial consciousness.",
         "Italian", "Intermediate", None),
        ("The Lean Startup Mindset",
         "amir.hassan@authorhub.com", business,
         "How modern entrepreneurs use continuous innovation to create successful businesses.",
         "English", "Intermediate", None),
        ("Cosmos and Consciousness",
         "sarah.chen@writes.org", science,
         "Bridging modern astrophysics and human consciousness through cutting-edge research.",
         "English", "Advanced", "storage/covers/quantum-mechanics.jpg"),
    ]

    for title, author_email, cat, desc, lang, level, cover in _published_books:
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            session.add(Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover,
                pdf_path=pdf_path,
                page_count=page_count,
                status=BookStatus.PUBLISHED,
                submitted_at=datetime.now(timezone.utc) - timedelta(days=30),
                published_at=datetime.now(timezone.utc) - timedelta(days=20),
            ))

    await session.flush()

    # ===========================================================================
    # BOOKS — PENDING REVIEW (5)
    # ===========================================================================

    _pending_books = [
        ("Quantum Mechanics: A Visual Guide",
         "sarah.chen@writes.org", science,
         "Explore quantum states, wave equations, and modern particle physics with visual aids.",
         "English", "Intermediate", "storage/covers/quantum-mechanics.jpg"),
        ("Designing for Humans",
         "yuki.tanaka@writes.jp", design,
         "A comprehensive guide to user-centred product design and UX research methodologies.",
         "English", "Intermediate", None),
        ("The Entrepreneur's Compass",
         "amir.hassan@authorhub.com", business,
         "Navigate the challenges of founding and scaling a startup in the modern economy.",
         "Arabic", "Intermediate", None),
        ("Roots of History",
         "i.rossi@literario.it", history,
         "A deep dive into the ancient civilizations that shaped the modern Western world.",
         "Italian", "Advanced", None),
        ("Mind Over Marathon",
         "eleanor.v@lumina.com", personal_growth,
         "Mental endurance strategies for high-performance athletes and everyday achievers.",
         "English", "Beginner", None),
    ]

    for title, author_email, cat, desc, lang, level, cover in _pending_books:
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            session.add(Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover,
                pdf_path=pdf_path,
                page_count=page_count,
                status=BookStatus.PENDING_REVIEW,
                submitted_at=datetime.now(timezone.utc) - timedelta(days=5),
            ))

    await session.flush()

    # ===========================================================================
    # BOOKS — DRAFT (4)
    # ===========================================================================

    _draft_books = [
        ("The Silent Grove",
         "eleanor.v@lumina.com", fiction,
         "A mystery novel set in ancient misty pine forests where secrets never die.",
         "Spanish", "Beginner", "storage/covers/the-silent-grove.jpg"),
        ("Neural Networks Demystified",
         "yuki.tanaka@writes.jp", programming,
         "A beginner-friendly deep dive into how modern neural networks actually work.",
         "English", "Intermediate", None),
        ("The Stoic CEO",
         "amir.hassan@authorhub.com", philosophy,
         "Applying ancient Stoic philosophy to modern leadership and business strategy.",
         "English", "Intermediate", None),
        ("Brushstrokes of Light",
         "i.rossi@literario.it", design,
         "The intersection of classical painting techniques and modern digital design.",
         "Italian", "Beginner", None),
    ]

    for title, author_email, cat, desc, lang, level, cover in _draft_books:
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            session.add(Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover,
                pdf_path=pdf_path,
                page_count=page_count,
                status=BookStatus.DRAFT,
            ))

    await session.flush()

    # ===========================================================================
    # BOOKS — REJECTED (3)
    # ===========================================================================

    _rejected_books = [
        ("Shadows and Echoes",
         "eleanor.v@lumina.com", fiction,
         "A rejected manuscript — contained unverified source material.",
         "English", "Intermediate", None),
        ("Data Without Borders",
         "sarah.chen@writes.org", technology,
         "A rejected submission — duplicate content detected from prior publication.",
         "English", "Advanced", None),
        ("The Unfinished Symphony",
         "amir.hassan@authorhub.com", non_fiction,
         "A rejected work — manuscript was incomplete at time of submission.",
         "Arabic", "Intermediate", None),
    ]

    for title, author_email, cat, desc, lang, level, cover in _rejected_books:
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            session.add(Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover,
                pdf_path=pdf_path,
                page_count=page_count,
                status=BookStatus.REJECTED,
                submitted_at=datetime.now(timezone.utc) - timedelta(days=60),
            ))

    await session.flush()
    logger.info(
        "Demo records seeded: 8 readers, 11 authors "
        "(5 approved, 4 pending, 2 rejected), 20 books "
        "(8 published, 5 pending, 4 draft, 3 rejected)."
    )


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

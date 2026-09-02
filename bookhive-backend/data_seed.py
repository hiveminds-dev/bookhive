import logging
import os
import re
import shutil
from datetime import UTC

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from orm_models.book import Book, BookStatus
from orm_models.category import Category
from orm_models.review import Review
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


def assign_seed_cover_for_book(book_index: int) -> str:
    """Ensures each book index gets a unique cover image in storage/covers/. Returns relative cover_path."""
    base_dir = os.path.join(os.path.dirname(__file__), "storage", "covers")
    os.makedirs(base_dir, exist_ok=True)

    target_filename = f"cover_{book_index}.jpg"
    target_path = os.path.join(base_dir, target_filename)

    if not os.path.exists(target_path):
        sample_names = ["beyond-good-and-evil.jpg", "quantum-mechanics.jpg", "the-silent-grove.jpg"]
        sample_name = sample_names[(book_index - 1) % len(sample_names)]
        sample_path = os.path.join(base_dir, sample_name)
        if os.path.exists(sample_path):
            shutil.copyfile(sample_path, target_path)
            logger.info(f"Copied {sample_name} to {target_filename} for book #{book_index}")

    return f"storage/covers/{target_filename}"


def assign_seed_author_avatar(author_index: int) -> str:
    """Ensures each author index gets a profile picture in storage/authors/. Returns relative avatar_path."""
    base_dir = os.path.join(os.path.dirname(__file__), "storage", "authors")
    os.makedirs(base_dir, exist_ok=True)

    target_filename = f"author_{author_index}.jpg"
    target_path = os.path.join(base_dir, target_filename)

    if not os.path.exists(target_path):
        covers_dir = os.path.join(os.path.dirname(__file__), "storage", "covers")
        sample_path = os.path.join(covers_dir, "beyond-good-and-evil.jpg")
        if os.path.exists(sample_path):
            shutil.copyfile(sample_path, target_path)
            logger.info(f"Assigned sample avatar for author #{author_index}")

    return f"storage/authors/{target_filename}"


DEFAULT_CATEGORIES: tuple[tuple[str, str], ...] = (
    (
        "Philosophy & Logic",
        "Classical and modern philosophical texts, logic frameworks, and ethics.",
    ),
    (
        "Science & Physics",
        "Quantum mechanics, physics, biology, astrophysics, and natural sciences.",
    ),
    (
        "Fiction & Novels",
        "Literary fiction, mystery, narrative prose, sci-fi, and drama.",
    ),
    (
        "History & Society",
        "World history, political science, anthropology, and social studies.",
    ),
    (
        "Technology",
        "Cloud architecture, artificial intelligence, cybersecurity, and digital systems.",
    ),
    (
        "Programming",
        "Python, TypeScript, software engineering, algorithms, and system design.",
    ),
    (
        "Business & Economy",
        "Microeconomics, finance, startup entrepreneurship, and global trade.",
    ),
    (
        "Art & Design",
        "Visual design, typography, architecture, user experience, and aesthetics.",
    ),
    (
        "Personal Growth",
        "Self-help, mindfulness, leadership, productivity, and personal resilience.",
    ),
    (
        "Sci-Fi",
        "Futuristic speculative fiction, space exploration, and cybernetic adventures.",
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

    from datetime import datetime, timedelta

    from orm_models.book import Book
    from orm_models.user import AuthorProfile

    # ===========================================================================
    # ADMIN STAFF (4 admins)
    # ===========================================================================

    _admin_staff = [
        ("Alexander Wright", "alexanderw", "alexander.wright@bookhive.com", UserRole.SUPER_ADMIN, "Super Admin", "Executive Governance", True, AccountStatus.ACTIVE),
        ("Samantha Reed", "samanthar", "samantha.reed@bookhive.com", UserRole.ADMIN, "Senior Editor", "Editorial & Curation", True, AccountStatus.ACTIVE),
        ("Marcus Vance", "marcusv", "marcus.vance@bookhive.com", UserRole.ADMIN, "Manuscript Moderator", "Author Compliance", False, AccountStatus.ACTIVE),
        ("Elena Rostova", "elenar", "elena.rostova@bookhive.com", UserRole.ADMIN, "Support Lead", "Community & Help Desk", False, AccountStatus.PENDING),
    ]

    for full_name, username, email, role, role_title, dept, two_fa, status in _admin_staff:
        existing = await get_user_by_email(session, email)
        if existing is None:
            session.add(User(
                full_name=full_name,
                username=username,
                email=email,
                password_hash=hash_password("Password123!"),
                email_verified=True,
                role=role,
                role_title=role_title,
                department=dept,
                two_factor_enabled=two_fa,
                account_status=status,
            ))
    await session.flush()

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

    reader_date_offsets = [5, 25, 55, 85, 115, 145, 175, 205, 235, 265]
    for idx, (full_name, username, email, _country) in enumerate(_readers_data):
        existing = await get_user_by_email(session, email)
        if existing is None:
            days_ago = reader_date_offsets[idx % len(reader_date_offsets)]
            session.add(User(
                full_name=full_name,
                username=username,
                email=email,
                password_hash=hash_password("Password123!"),
                email_verified=True,
                role=UserRole.READER,
                account_status=AccountStatus.ACTIVE,
                created_at=datetime.now(UTC) - timedelta(days=days_ago),
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
    author_counter = 0

    for full_name, username, email, pen_name, country, language, bio in _approved_authors:
        author_counter += 1
        avatar_path = assign_seed_author_avatar(author_counter)
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
                profile_image_path=avatar_path,
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
        author_counter += 1
        avatar_path = assign_seed_author_avatar(author_counter)
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
                profile_image_path=avatar_path,
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
        author_counter += 1
        avatar_path = assign_seed_author_avatar(author_counter)
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
                profile_image_path=avatar_path,
            ))
            await session.flush()

    # ===========================================================================
    # FETCH ALL CATEGORIES
    # ===========================================================================

    philosophy = await get_category_by_name(session, "Philosophy & Logic")
    science = await get_category_by_name(session, "Science & Physics")
    fiction = await get_category_by_name(session, "Fiction & Novels")
    history = await get_category_by_name(session, "History & Society")
    technology = await get_category_by_name(session, "Technology")
    programming = await get_category_by_name(session, "Programming")
    business = await get_category_by_name(session, "Business & Economy")
    design = await get_category_by_name(session, "Art & Design")
    personal_growth = await get_category_by_name(session, "Personal Growth")
    await get_category_by_name(session, "Sci-Fi")

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

    published_dates_offsets = [15, 45, 75, 105, 135, 165, 195, 225]
    views_counts = [12402, 10115, 9842, 8530, 7210, 6100, 5400, 4800]
    downloads_counts = [4200, 3100, 2800, 2100, 1800, 1500, 1200, 950]

    for idx, (title, author_email, cat, desc, lang, level, _cover) in enumerate(_published_books):
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        cover_path = assign_seed_cover_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            days_ago = published_dates_offsets[idx % len(published_dates_offsets)]
            views = views_counts[idx % len(views_counts)]
            downloads = downloads_counts[idx % len(downloads_counts)]
            session.add(Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover_path,
                pdf_path=pdf_path,
                page_count=page_count,
                view_count=views,
                download_count=downloads,
                status=BookStatus.PUBLISHED,
                created_at=datetime.now(UTC) - timedelta(days=days_ago + 10),
                submitted_at=datetime.now(UTC) - timedelta(days=days_ago + 5),
                published_at=datetime.now(UTC) - timedelta(days=days_ago),
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

    for title, author_email, cat, desc, lang, level, _cover in _pending_books:
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        cover_path = assign_seed_cover_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            session.add(Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover_path,
                pdf_path=pdf_path,
                page_count=page_count,
                status=BookStatus.PENDING_REVIEW,
                submitted_at=datetime.now(UTC) - timedelta(days=5),
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

    for title, author_email, cat, desc, lang, level, _cover in _draft_books:
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        cover_path = assign_seed_cover_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            session.add(Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover_path,
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
         "amir.hassan@authorhub.com", history,
         "A rejected work — manuscript was incomplete at time of submission.",
         "Arabic", "Intermediate", None),
    ]

    for title, author_email, cat, desc, lang, level, _cover in _rejected_books:
        author = _author(author_email)
        if cat is None or author is None:
            continue
        book_counter += 1
        pdf_path, page_count = assign_seed_pdf_for_book(book_counter)
        cover_path = assign_seed_cover_for_book(book_counter)
        result = await session.execute(select(Book).where(Book.title == title))
        if result.scalar_one_or_none() is None:
            rejected_b = Book(
                title=title,
                author_id=author.id,
                category_id=cat.id,
                description=desc,
                language=lang,
                reading_level=level,
                cover_image_path=cover_path,
                pdf_path=pdf_path,
                page_count=page_count,
                status=BookStatus.REJECTED,
                submitted_at=datetime.now(UTC) - timedelta(days=60),
            )
            session.add(rejected_b)
            await session.flush()
            from orm_models.book_rejection_log import BookRejectionLog
            session.add(BookRejectionLog(
                book_id=rejected_b.id,
                reason=desc,
                created_at=datetime.now(UTC) - timedelta(days=58),
            ))

    await session.flush()
    await seed_demo_reviews(session)
    logger.info(
        "Demo records seeded: 8 readers, 11 authors "
        "(5 approved, 4 pending, 2 rejected), 20 books "
        "(8 published, 5 pending, 4 draft, 3 rejected), and dynamic reviews."
    )


SAMPLE_REVIEWS = [
    (5, "An exceptional read! Highly recommended for anyone interested in this discipline. The logical structure and clear narrative make complex ideas digestible."),
    (4, "Thorough research and well-crafted chapters. A valuable contribution to modern literature and technical analysis."),
    (5, "A masterpiece of clarity and vision. Dense concepts are transformed into intuitive, captivating insights."),
    (5, "Captivating from start to finish! The author clearly knows their craft and presents the material seamlessly."),
    (4, "Insightful perspective with solid practical examples. Looking forward to more releases from this author."),
    (3, "Good introductory overview, though some chapters could explore deeper nuances."),
    (5, "Brilliant execution and formatting. Highly inspiring reading material!")
]


async def seed_demo_reviews(session: AsyncSession) -> None:
    """Seed dynamic reader reviews for published books, keeping at least one published book review-free."""
    from datetime import datetime, timedelta
    published_books = (
        await session.execute(
            select(Book)
            .where(Book.status == BookStatus.PUBLISHED)
            .order_by(Book.id.asc())
        )
    ).scalars().all()
    readers = (
        await session.execute(
            select(User).where(User.role == UserRole.READER)
        )
    ).scalars().all()

    if not published_books or not readers:
        return

    # Leave the last published book without reviews for testing create-review flow
    books_to_review = published_books[:-1] if len(published_books) > 1 else published_books

    for book in books_to_review:
        existing_res = await session.execute(
            select(func.count(Review.id)).where(Review.book_id == book.id)
        )
        if (existing_res.scalar_one_or_none() or 0) > 0:
            continue

        num_reviews = min(2 + (book.id % 2), len(readers))
        # Use a distinct slice of readers for this book to guarantee unique (book_id, user_id)
        for i in range(num_reviews):
            reader = readers[(book.id + i) % len(readers)]
            rating, comment = SAMPLE_REVIEWS[(book.id + i) % len(SAMPLE_REVIEWS)]
            session.add(Review(
                book_id=book.id,
                user_id=reader.id,
                rating=rating,
                comment=comment,
                created_at=datetime.now(UTC) - timedelta(days=(book.id * 3 + i * 2))
            ))
    await session.flush()


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

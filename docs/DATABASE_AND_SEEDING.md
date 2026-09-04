# BookHive Database and Seeding

## Database model

BookHive uses PostgreSQL through asynchronous SQLAlchemy. Routers call services, services apply business rules, and repositories perform database operations. Main records include Users, Reader profiles, Author profiles, Books, Categories, Reviews, and book rejection/revision history.

## Startup lifecycle

FastAPI initializes the current ORM schema during startup. Alembic migrations are not currently used.

| Setting | Effect |
|---|---|
| `RESET_DATABASE_ON_STARTUP` | Drops and recreates application tables when allowed |
| `SEED_DATABASE_ON_STARTUP` | Runs initial user/category seeding |
| `SEED_DEMO_DATA` | Adds the extended local demonstration dataset |

Reset is restricted to development/test environments, but it still destroys local application data. Keep it disabled unless a clean rebuild is intended.

## Seed behaviour and media

Seeding is designed to be idempotent and checks stable fields before inserting records. The repository contains:

- source PDFs under `storage/books/sample*.pdf`;
- three source covers under `storage/covers/`;
- Author demo images under `storage/authors/`.

During seeding, source media is copied to generated filenames used by demo records. Generated copies, ZIP archives, and user uploads are intentionally ignored by Git.

## Storage settings

```dotenv
STORAGE_ROOT=./storage
BOOK_STORAGE_PATH=./storage/books
COVER_STORAGE_PATH=./storage/covers
PROFILE_IMAGE_STORAGE_PATH=./storage/profiles
MAX_BOOK_SIZE_MB=50
MAX_COVER_SIZE_MB=5
MAX_PROFILE_IMAGE_SIZE_MB=5
```

FastAPI serves configured files through `/storage`. Upload validation must continue to enforce type, content, and maximum size.

## Administrators

Initial Admin and Super Admin identities come from `.env`. Placeholder passwords are rejected when seeding is enabled. See [SEED_ACCOUNTS.md](../SEED_ACCOUNTS.md).

## Production requirements

Before production: disable reset and demo data; adopt a reviewed migration strategy; use managed secrets; use durable media storage; and define backup, restore, retention, and access-control procedures.

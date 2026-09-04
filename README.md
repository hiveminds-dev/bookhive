# BookHive

**Online Book Publishing and Reading Platform**

BookHive is a web platform where approved authors can publish PDF books and
readers can search, read, download, rate, and review published books.

BookHive is developed by Team Nexora in the HiveMinds repository organization.

## Main Workflow

1. A reader or author creates an account and verifies the registered email
   address.
2. A verified reader account becomes active and can sign in.
3. A verified author account remains pending until an admin approves or rejects
   the application.
4. An approved author submits a PDF book.
5. An admin approves or rejects the submitted book.
6. An approved book becomes available to readers.
7. Signed-in readers can search, read, download, rate, and review published
   books.

## MVP Features

### Reader

- Register, verify an email address, sign in, and sign out
- Reset a forgotten password
- View published books
- Search and filter books
- View book information
- Read PDF books in the browser
- Download PDF books
- Add or update a rating and review while signed in
- View paginated book results

Each reader can have only one active rating and review per book. A reader may
update that review later. Anonymous reviews and device-based identification are
not part of the MVP.

### Author

- Register, verify an email address, sign in, and sign out
- Reset a forgotten password
- View account approval status
- Manage the author profile
- Submit a PDF book with a cover image
- Save a book as a draft
- View book approval status
- Edit and resubmit a rejected book

### Admin

- Sign in to the admin dashboard
- Create another admin account
- Approve or reject author applications
- Approve or reject submitted books
- Add a rejection reason
- Manage books, authors, categories, ratings, and reviews
- View dashboard summaries

## Technologies

| Area | Technology |
|---|---|
| Frontend | Angular 21 |
| Backend | Python 3.14, FastAPI, Uvicorn |
| Database | PostgreSQL, SQLAlchemy ORM |
| Testing | Pytest, pytest-asyncio, HTTPX |
| Code quality | Ruff |
| Project management | Agile, Scrum, Jira |
| Version control | Git and GitHub |
| Automation | GitHub Actions, Dependabot, CodeQL |

## Project Structure

```text
bookhive/
├── .github/                 # GitHub workflows and templates
├── bookhive-backend/        # FastAPI backend
├── bookhive-frontend/       # Angular frontend
├── docs/                    # Setup, testing, API, and architecture guides
├── SEED_ACCOUNTS.md         # Local demo accounts and scenarios
└── README.md                # Project guide
```

The backend follows this simple flow:

```text
Router -> Service -> Repository -> SQLAlchemy ORM -> PostgreSQL
```

## Before You Start

Install the following software:

- Git
- Python 3.14
- PostgreSQL
- Node.js 22
- Angular CLI 21

## Backend Setup

Open a terminal inside `bookhive-backend` and run:

```bash
python3.14 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Generate a secure 32-byte hexadecimal `SECRET_KEY` using `openssl rand -hex 32`
(or `python3 -c "import secrets; print(secrets.token_hex(32))"`) and update `SECRET_KEY`
in `.env`.

Create the PostgreSQL database and update the database values in `.env`.

Run the FastAPI application with:

```bash
uvicorn main:app --reload
```

The default API address will be:

```text
http://127.0.0.1:8000
```

The Swagger API documentation will be available at:

```text
http://127.0.0.1:8000/docs
```

Check the API and PostgreSQL connections with:

```text
http://127.0.0.1:8000/api/health
http://127.0.0.1:8000/api/health/database
```

## Frontend Setup

Open a terminal inside the existing `bookhive-frontend` application and run:

```bash
npm ci
npm start
```

The frontend will normally be available at:

```text
http://localhost:4200
```

## Tests and Code Checks

Run these commands inside `bookhive-backend`:

```bash
pytest
ruff check .
```

Run these commands inside `bookhive-frontend`:

```bash
npm test -- --watch=false
npm run build
```

GitHub Actions will also run backend and frontend checks when code is pushed or
a pull request is created for `main` or `develop`.

## Documentation

| Document | Purpose |
|---|---|
| [Local setup](docs/LOCAL_SETUP.md) | Install, configure, seed, and run BookHive |
| [Testing guide](docs/TESTING_GUIDE.md) | Automated and three-role manual verification |
| [Feature status](docs/FEATURE_STATUS.md) | Implemented, partial, and deferred scope |
| [API overview](docs/API_OVERVIEW.md) | Endpoint groups, access roles, and Swagger |
| [Database and seeding](docs/DATABASE_AND_SEEDING.md) | Schema lifecycle, reset flags, media, and demo data |
| [Architecture](docs/ARCHITECTURE.md) | Components, roles, data flow, and book lifecycle |
| [Branching and PR guide](docs/BRANCHING_AND_PR_GUIDE.md) | Team Git workflow and merge checklist |
| [Known limitations](docs/KNOWN_LIMITATIONS.md) | Current technical and product constraints |
| [Changelog](docs/CHANGELOG.md) | Completed development milestones |
| [Seed accounts](SEED_ACCOUNTS.md) | Local-only Reader, Author, and Admin accounts |

## Git Branch Flow

```text
main
└── develop
    ├── feature/author-registration
    ├── feature/book-submission
    └── fix/short-description
```

- `main` contains stable code.
- `develop` contains combined development work.
- `feature/...` is used for a new feature.
- `fix/...` is used for a bug fix.
- Create a pull request before merging code into `develop` or `main`.

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/author-registration
```

## Environment and Security

- Do not commit the `.env` file.
- Do not place passwords or secret keys in source code.
- Use `.env.example` only as a safe template for version control.
- Generate a cryptographically secure `SECRET_KEY` (at least 32 characters) using `openssl rand -hex 32`.
- Changing the `SECRET_KEY` immediately invalidates all previously issued JWT access tokens.
- Uploaded PDFs and cover images are stored on the server for the MVP.
- Validate file type and file size before saving uploads.

## Future Features

- Bookmarks and reading history
- Subscription plans and payments
- Book recommendations
- Reader communities
- Author analytics

## Team

**Team Nexora**

C-Clarke Institute  
Advanced AI and Software Engineering

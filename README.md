# BookHive

**Online Book Publishing and Reading Platform**

BookHive is a web platform where approved authors can publish PDF books and
readers can search, read, download, rate, and review published books.

This project is developed by **Team Nexora** for the **Advanced AI and Software
Engineering** course at **C-Clarke Institute**.

## Main Workflow

1. An author creates an account.
2. An admin approves or rejects the author account.
3. An approved author submits a PDF book.
4. An admin approves or rejects the submitted book.
5. An approved book becomes available to the public.
6. Readers can search, read, download, rate, and review the book.

## MVP Features

### Public Reader

- View published books
- Search and filter books
- View book information
- Read PDF books in the browser
- Download PDF books
- Add an anonymous rating or review
- View paginated book results

Anonymous ratings and reviews will use a generated device identifier stored in
the browser. It is intended to reduce duplicate submissions without requiring a
reader account.

### Author

- Register and sign in
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

Email verification and reader accounts are not included in the current MVP.

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

The Angular project will be kept inside `bookhive-frontend`.

After the Angular project is created, open a terminal in that folder and run:

```bash
npm install
ng serve
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

GitHub Actions will also run backend and frontend checks when code is pushed or
a pull request is created for `main` or `develop`.

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
- Use `.env.example` only as a safe example.
- Uploaded PDFs and cover images are stored on the server for the MVP.
- Validate file type and file size before saving uploads.

## Future Features

- Reader accounts
- Email verification
- Bookmarks and reading history
- Subscription plans and payments
- Book recommendations
- Reader communities
- Author analytics

## Team

**Team Nexora**  
C-Clarke Institute  
Advanced AI and Software Engineering

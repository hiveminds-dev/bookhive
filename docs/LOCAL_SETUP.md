# BookHive Local Setup

This guide describes the supported local development setup for the current `develop` branch.

## Requirements

- Git
- Python 3.14
- PostgreSQL
- Node.js 22 and npm
- Angular CLI 21 (optional when using npm scripts)

## Clone and select the development branch

```bash
git clone https://github.com/hiveminds-dev/bookhive.git
cd bookhive
git checkout develop
git pull --ff-only origin develop
```

## Configure PostgreSQL

Create a local PostgreSQL database and user that can create and update tables. The example database is `bookhive` on `localhost:5432`. Keep real credentials only in `.env`.

## Configure and run the backend

```bash
cd bookhive-backend
python3.14 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Update database credentials, initial administrator passwords, and `SECRET_KEY` in `.env`. Generate a secret with:

```bash
openssl rand -hex 32
```

For a disposable local demo database:

```dotenv
APP_ENV=development
RESET_DATABASE_ON_STARTUP=true
SEED_DATABASE_ON_STARTUP=true
SEED_DEMO_DATA=true
```

`RESET_DATABASE_ON_STARTUP=true` deletes existing application tables. Use it only when losing local data is acceptable. Start the API with:

```bash
uvicorn main:app --reload
```

- API: <http://127.0.0.1:8000>
- Swagger: <http://127.0.0.1:8000/docs>
- Health: <http://127.0.0.1:8000/api/health>
- Database health: <http://127.0.0.1:8000/api/health/database>

## Configure and run the frontend

In a second terminal:

```bash
cd bookhive-frontend
npm ci
npm start
```

Open <http://localhost:4200>. The Angular development proxy forwards API calls to the backend.

## Email delivery

Email verification and password reset require SMTP when `SMTP_ENABLED=true`. For Gmail, use a Google App Password rather than the normal account password. Keep SMTP credentials in `.env`. Tests mock delivery and do not require a real SMTP account.

## Shared demo media

The repository contains source seed PDFs, covers, and Author images. Startup seeding creates generated book and cover copies locally. Runtime uploads, generated copies, and ZIP archives remain ignored by Git.

See [Database and seeding](DATABASE_AND_SEEDING.md) and [seed accounts](../SEED_ACCOUNTS.md).

## Common problems

| Symptom | Check |
|---|---|
| Initial admin password error | Replace placeholder admin passwords in `.env` |
| Invalid `SECRET_KEY` error | Use a unique value of at least 32 characters |
| Database connection failure | Confirm PostgreSQL and all database settings |
| Port already in use | Stop the existing process or select another port |
| Email delivery unavailable | Check `SMTP_ENABLED` and SMTP credentials |
| Missing demo books | Enable startup seeding and demo data |

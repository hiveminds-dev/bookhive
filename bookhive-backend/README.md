# BookHive Backend

Simple FastAPI backend structure using this flow:

`Router -> Service -> Repository -> SQLAlchemy ORM -> PostgreSQL`

Application entry point: `main.py`

## Initial role seeding

When `SEED_DATABASE_ON_STARTUP=true`, the backend creates the required startup
accounts without duplicating existing records:

- a regular administrator from `INITIAL_ADMIN_*`
- a super administrator from `INITIAL_SUPER_ADMIN_*`

Both seeded accounts are created as active, email-verified users. Before running
the app locally or in a shared environment, replace the placeholder passwords in
`.env` with secure values.

If an existing PostgreSQL database was created before the `super_admin` role was
added, update the existing enum before startup seeding. Confirm the enum type
name and stored labels in your database first. For this SQLAlchemy enum setup,
the stored labels are usually uppercase enum names:

```sql
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
```

After this readiness branch is merged into `develop`, run the backend tests,
frontend tests, and a development frontend build before opening the `develop` to
`main` pull request. Also manually verify login/profile loading for reader,
author, admin, and super admin users.

## Gmail email verification setup

Enable 2-Step Verification on the sender Google account and create a Google App
Password. Add these values to the local `.env` file (never commit that file):

```env
EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES=60
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_sender@gmail.com
SMTP_PASSWORD=your_16_character_google_app_password
SMTP_FROM_EMAIL=your_sender@gmail.com
SMTP_USE_TLS=true
```

Restart Uvicorn after changing `.env`. A successful registration sends the
verification link to the supplied address. When SMTP is disabled in development,
the same link is written to the backend log for local testing.

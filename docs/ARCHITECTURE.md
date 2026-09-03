# BookHive Architecture

## System overview

```text
Browser
  |
Angular 21
  |
  | HTTP / JSON / multipart
  v
FastAPI routers
  |
Services (business rules)
  |
Repositories + async SQLAlchemy
  |
  +--------------------+
  |                    |
PostgreSQL        Server file storage
                  (PDFs, covers, profiles)
```

SMTP provides email verification and password-reset delivery. GitHub Actions run backend, frontend, and CodeQL checks.

## Roles

```text
Public -> published catalogue and public book details
Reader -> profile, reading, download, and reviews
Approved Author -> profile, drafts, uploads, submission, and tracking
Admin -> moderation, categories, accounts, and dashboard
Super Admin -> Admin access plus protected staff governance
```

UI guards improve navigation, but backend permission checks are authoritative.

## Account lifecycle

```text
Registration -> Email verification
                  |-> Reader: ACTIVE
                  |-> Author: PENDING -> APPROVED or REJECTED
```

## Book lifecycle

```text
DRAFT -> PENDING_REVIEW -> PUBLISHED
                  |-----> REJECTED -----------|
                  |-----> CHANGES_REQUESTED --|-> edit -> PENDING_REVIEW
```

Only `PUBLISHED` books appear through public catalogue/detail routes.

## Trust boundaries

- The browser is untrusted; the API validates roles, ownership, payloads, and transitions.
- Uploads require type, content, and size validation.
- `.env` contains secrets and is not version controlled.
- Seed credentials and media are development-only.

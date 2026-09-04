# BookHive Testing Guide

Run automated checks first, then verify the main workflow through the browser.

## Automated checks

```bash
cd bookhive-backend
source .venv/bin/activate
pytest -q

cd ../bookhive-frontend
npm test -- --watch=false
npm run build

cd ..
git diff --check
```

The exact test count may increase. Success means every discovered test passes and the production build finishes without errors.

## Preparation

1. Start PostgreSQL.
2. Configure `.env` for development seeding.
3. Start FastAPI on port 8000.
4. Start Angular on port 4200.
5. Select accounts from [SEED_ACCOUNTS.md](../SEED_ACCOUNTS.md).

Never use demo passwords outside local development.

## Reader flow

1. Register a Reader and verify the email.
2. Sign in and confirm the Reader route opens.
3. Search and filter the published catalogue.
4. Open a preview and its PDF reader.
5. Change pages and confirm all current-page indicators agree.
6. Download the PDF.
7. Create and update a rating/review; confirm only one active review exists for the Reader/book pair.
8. Sign out and confirm protected pages require authentication.

## Author flow

1. Register an Author with profile details and an optional image.
2. Verify the email and confirm the application remains pending.
3. Approve the Author from an Admin account.
4. Sign in as the approved Author and confirm dashboard counts use real books.
5. Create a draft, choose a category, upload a cover and PDF, and save it.
6. Edit and submit the draft for review.
7. Confirm `PENDING_REVIEW` books are absent from the public catalogue.
8. Verify rejected books show a reason and can be edited and resubmitted.

## Admin flow

1. Sign in with an active Admin account.
2. Confirm dashboard values load from the API.
3. Approve and reject Author applications.
4. Approve, reject, or request changes for submitted books.
5. Confirm an approved book becomes `PUBLISHED` and appears publicly.
6. Manage category status and confirm active categories appear to Authors.
7. Verify account actions respect Admin and Super Admin permissions.

## Access-control expectations

| Scenario | Expected result |
|---|---|
| Unauthenticated protected request | `401 Unauthorized` |
| Reader calls Author/Admin endpoint | `403 Forbidden` |
| Pending or rejected Author publishes | `403 Forbidden` |
| Author calls Admin endpoint | `403 Forbidden` |
| Public requests a non-published book | `404 Not Found` |
| Invalid registration email check | `422 Unprocessable Entity` |

## UI smoke checks

Test near 375, 768, 1024, and 1440 pixels wide. Confirm there is no unintended overflow; navigation, tables, forms, and modals remain usable; keyboard focus is visible; images load; loading/error/empty states are clear; and the browser console has no new errors.

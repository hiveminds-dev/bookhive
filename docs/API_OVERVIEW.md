# BookHive API Overview

The API uses the `/api` prefix. Swagger at <http://127.0.0.1:8000/docs> is authoritative for payload schemas.

| Prefix | Responsibility | Typical access |
|---|---|---|
| `/api/health` | API and database health | Public |
| `/api/auth` | Login, session, email, and password flows | Public/authenticated |
| `/api/users` | Reader registration and current-user profile | Public/authenticated |
| `/api/authors` | Author registration, status, and profile | Public/Author |
| `/api/catalogue` | Published-book discovery | Public |
| `/api/books` | Drafts, files, submission, lists, and details | Public/Author |
| `/api/categories` | Active categories and maintenance | Public/Admin |
| `/api/reviews` | Book reviews and current Reader review | Public/Reader |
| `/api/admin` | Dashboards, moderation, accounts, and statistics | Admin/Super Admin |

## Important authentication routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/auth/check-email`
- `GET /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `PUT /api/auth/change-password`
- `POST /api/auth/request-password-otp`
- `POST /api/auth/verify-password-otp`

Protected requests use the authentication scheme shown in Swagger. Backend identity, role, approval, ownership, and lifecycle checks are authoritative.

## Behaviour summary

Author routes support drafts, editing, uploads, submission, and Author-owned lists. Admin routes support approval, rejection, revision requests, and account/category operations. Public catalogue and detail routes expose only published books. A Reader can maintain one review per book.

## Error conventions

- `400`: invalid operation or lifecycle transition
- `401`: authentication required or invalid credentials
- `403`: authenticated but not permitted
- `404`: resource unavailable or intentionally hidden
- `409`: uniqueness or state conflict where applicable
- `422`: request/query validation failure
- `429`: rate-limited operation
- `503`: external dependency such as email delivery is unavailable

Do not expose database errors, credentials, tokens, or internal paths in API responses.

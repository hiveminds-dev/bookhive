# BookHive Registration Requirements

## 1. Purpose

This document defines the MVP registration and email-verification requirements
for BookHive. It is the agreed reference for frontend, backend, database, and
testing work related to account creation.

## 2. Supported Account Types

Public registration supports only the following roles:

- `READER`
- `AUTHOR`

`ADMIN` and `SUPER_ADMIN` accounts must never be created through public
registration. A seeded Super Admin creates or manages administrative accounts.

## 3. Common Registration Requirements

Reader and author registration must collect and validate:

- Full name
- Username
- Email address
- Password
- Password confirmation on the frontend
- Acceptance of the Terms of Service and Privacy Policy

The system must:

- Normalize email addresses before comparison and storage.
- Treat email addresses and usernames as unique without case sensitivity.
- Hash passwords with the configured secure password hasher before storage.
- Never return or log a password or password hash.
- Reject unsupported public roles such as Admin or Super Admin.
- Return field-level validation errors that the frontend can display safely.
- Rate-limit repeated registration and verification requests.

## 4. Reader Registration

### Required fields

- Full name
- Username
- Email address
- Password
- Terms acceptance

### Initial state

When a reader registers successfully:

- `role` is `READER`.
- `email_verified` is `false`.
- `account_status` is `INACTIVE` until email verification succeeds.
- A verification email is sent to the registered address.

### Activation flow

```text
Reader Registration
-> Verification Email Sent
-> Email Verified
-> Account Status ACTIVE
-> Reader Can Sign In
```

## 5. Author Registration

### Required fields

- Full name
- Pen name
- Username
- Email address
- Country
- Preferred language
- Short biography
- Password
- Author agreement acceptance

A profile image is optional and may be uploaded after the author record has
been created.

### Initial state

When an author registers successfully:

- `role` is `AUTHOR`.
- `email_verified` is `false`.
- `account_status` is `PENDING`.
- An Author Profile is created in the same database transaction.
- A verification email is sent to the registered address.

### Approval flow

```text
Author Registration
-> Verification Email Sent
-> Email Verified
-> Account Remains PENDING
-> Admin Reviews Application
-> APPROVED or REJECTED
```

An author must be both email-verified and approved before submitting a book.
An author who is pending or rejected may sign in only to view the account
status and permitted profile information.

## 6. Email Verification

The verification mechanism must:

- Generate a cryptographically secure random token.
- Send the raw token only through the verification link.
- Store only a hash of the token in the database.
- Associate the token with exactly one user.
- Set an expiry time.
- Allow each token to be used only once.
- Invalidate older active tokens when a replacement is issued.
- Apply a resend cooldown to prevent email abuse.
- Return a safe result for invalid, expired, reused, and already-verified links.

Required API operations:

```text
POST /api/users/register
POST /api/authors/register
GET  /api/auth/verify-email?token=...
POST /api/auth/resend-verification
```

## 7. Rating and Review Requirement

Anonymous ratings and reviews are not included in the MVP.

- A user must be authenticated as a Reader to submit a rating or review.
- A Reader can have only one active rating and review for each book.
- The same Reader may update the existing rating and review.
- Reviews display the Reader username or approved display name.
- Admins can moderate reviews according to platform rules.

The database must enforce uniqueness using the Reader and Book relationship,
for example:

```text
UNIQUE(reader_id, book_id)
```

## 8. Validation Rules

- Full name: 2-100 characters
- Username: 3-50 characters; letters, numbers, and underscore only
- Email: valid email format and maximum database-supported length
- Password: 8-128 characters at minimum for the MVP
- Pen name: 2-100 characters
- Short biography: maximum 500 characters
- Profile image: optional; only approved image types and configured file-size
  limit are accepted

Frontend validation improves usability, but the backend must independently
enforce every security and data-integrity rule.

## 9. Required User Feedback

The registration UI must provide:

- Field-level validation messages
- Submitting/loading state
- Duplicate email and username messages
- General server/network error message
- Successful registration confirmation
- Verification-email instructions
- Resend-verification status and cooldown
- Verification success, invalid-token, and expired-token states
- Author pending, approved, and rejected account-status states

## 10. Acceptance Criteria

Registration is complete when:

1. A valid Reader registration creates an inactive, unverified Reader.
2. A valid Author registration creates an unverified, pending Author and Author
   Profile in one transaction.
3. Duplicate email and username registrations are rejected safely.
4. Passwords are stored only as secure hashes.
5. Public requests cannot create Admin or Super Admin accounts.
6. Verification activates a Reader but leaves an Author pending for Admin
   approval.
7. Invalid, expired, and reused verification tokens are rejected.
8. The Angular registration form sends real API requests and displays backend
   success and error responses.
9. Backend and frontend automated tests cover the critical Reader and Author
   registration flows.
10. A signed-in Reader, rather than an anonymous device, owns each rating and
    review.

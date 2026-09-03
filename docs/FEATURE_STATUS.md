# BookHive Feature Status

This status reflects the current `develop` branch and is not a production-readiness declaration.

## Implemented and verified

### Authentication and accounts

- Reader and Author registration
- Email format and availability checks
- Email verification and resend
- Login, logout, and current-user session handling
- Forgot-password, reset-password, and authenticated password change
- Reader, Author, Admin, and Super Admin access control
- Pending, approved, and rejected Author states

### Reader

- Published catalogue, search, filters, and pagination
- Book previews, PDF reading, and downloads
- Rating/review creation, update, retrieval, and deletion
- Profile details and profile-image management

### Author

- Profile management and real-data dashboard summaries
- Draft creation and editing
- Category, PDF, and cover handling
- Submission, rejection feedback, resubmission, and status tracking

### Admin

- Dynamic dashboard and recent activity
- Author and book moderation
- Reader, Author, and staff account actions
- Category management
- Statistics and implemented system-log views

### Engineering support

- PostgreSQL with asynchronous SQLAlchemy
- Development schema initialization and optional reset/seeding
- Shared seed PDFs, covers, and Author images
- Backend/frontend automated tests and production build
- GitHub Actions for backend, frontend, and CodeQL

## Partial or intentionally limited

- Author analytics show only metrics supported by current data.
- Fake platform-health and storage percentages are not displayed.
- Media uses server filesystem storage, suitable for the MVP but not horizontally scaled hosting.
- SMTP delivery depends on an externally configured sender.

## Deferred to Phase 2

- Communities, discussions, events, follows, and social activity
- Subscriptions and payments
- Personalized recommendations
- Advanced bookmarks, history, and offline reading beyond the current Reader flow
- Advanced Author analytics and monetization
- Real infrastructure monitoring and capacity reporting

See [Known limitations](KNOWN_LIMITATIONS.md) before planning a release.

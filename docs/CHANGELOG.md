# BookHive Development Changelog

This file summarizes major milestones. Pull requests and Git history remain the detailed source of truth.

## Current develop milestone

### Authentication and security

- Completed Reader/Author registration, email verification, resend, login/logout, password reset, secure JWT configuration, and role-based access.
- Added validated, race-safe registration email availability checking.

### Reader workflow

- Completed published-book discovery, preview, PDF reading/download, and reviews.
- Corrected current-page consistency across Reader indicators.

### Author workflow

- Completed drafts, uploads, submission, feedback, resubmission, and tracking.
- Replaced fabricated dashboard content with real data and truthful empty states.
- Corrected asynchronous book/category rendering.

### Admin workflow

- Integrated dynamic dashboards, moderation, account actions, categories, and permissions.
- Removed unsupported fake platform-health data and represented deferred Community Management honestly.

### UI and developer experience

- Standardized shared forms, modals, focus, responsive tables, and Reader/review styles.
- Lazy-loaded top-level layouts and reduced the initial bundle.
- Consolidated assets and corrected image fallbacks.
- Added shared seed PDFs/covers and completed `.env.example` settings.

### Verification baseline

At the UI/auth stabilization milestone, 220 backend tests and 515 frontend tests passed; the production build completed without budget warnings; and local email validation and seed media endpoints were verified. Test counts may grow.

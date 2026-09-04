# BookHive Known Limitations

These limitations apply to the current development version.

## Product scope

- Community features are Phase 2; screens must not present fabricated activity as live data.
- Subscriptions, payments, recommendations, and monetization are not completed.
- Advanced analytics are limited to data supported by existing APIs.
- Platform-health and storage-capacity values are unavailable from real monitoring and must not be hardcoded.

## Deployment and storage

- A production hosting platform has not been finalized.
- Media uses server filesystem storage; ephemeral hosts can lose it without a persistent volume.
- No CDN, object-storage lifecycle, malware-scanning service, or production media backup is configured.

## Database lifecycle

- Alembic migrations are not used; development relies on ORM initialization and optional reset/seeding.
- Reset-on-startup is destructive and must stay disabled for persistent and production databases.
- Production migration, backup, and restore procedures remain to be defined.

## Email

- Verification and password reset require valid SMTP configuration.
- Gmail App Password availability depends on account security policy.
- Mocked tests do not prove production sender reputation or deliverability.

## Security and release readiness

- GitHub dependency/security alerts require separate review.
- Security review, QA/UAT, deployment configuration, monitoring, backups, and recovery testing are required before release.
- Demo credentials and seed media are development-only.

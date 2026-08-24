# BookHive Development Seed Accounts

> These accounts are created by the BookHive development seed process and are intended only for local development, demonstrations, and testing. Never use these credentials in production.

---

## Seed Instructions

### How to Seed the Database
Database seeding executes automatically on application startup when enabled in configuration.

1. Ensure the PostgreSQL database is running and configured in `.env`.
2. Configure seeding flags in `.env`:
   ```bash
   APP_ENV=development
   SEED_DATABASE_ON_STARTUP=true
   SEED_DEMO_DATA=true
   ```
3. Start the FastAPI backend server:
   ```bash
   cd bookhive-backend
   source .venv/bin/activate
   uvicorn main:app --reload --port 8000
   ```

### Prerequisites and Idempotency
- **Prerequisites:** PostgreSQL database with schema initialized.
- **Repeatability:** Running the seed script repeatedly is **safe and idempotent**. The seed logic verifies existing records by email, username, category name, and book title before creating any new entry, skipping duplicates without throwing integrity errors.

---

## Administrator Accounts

| Role | Name | Email/Username | Password or Source | Email Verified | Account Status | Purpose |
|---|---|---|---|---|---|---|
| `super_admin` | Initial Super Administrator | Defined by `INITIAL_SUPER_ADMIN_EMAIL` / `INITIAL_SUPER_ADMIN_USERNAME` (Default: `superadmin@bookhive.com` / `bookhive_super_admin`) | Defined by `INITIAL_SUPER_ADMIN_PASSWORD` in `.env` | Yes (`true`) | `ACTIVE` | Initial root super administrator created from environment configuration |
| `admin` | Initial Administrator | Defined by `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_USERNAME` (Default: `admin@bookhive.com` / `bookhive_admin`) | Defined by `INITIAL_ADMIN_PASSWORD` in `.env` | Yes (`true`) | `ACTIVE` | Initial system administrator created from environment configuration |
| `super_admin` | Alexander Wright | `alexander.wright@bookhive.com` (`alexanderw`) | `Password123!` | Yes (`true`) | `ACTIVE` | Super Admin governance demonstrations (Role: Super Admin, Dept: Executive Governance, 2FA enabled) |
| `admin` | Samantha Reed | `samantha.reed@bookhive.com` (`samanthar`) | `Password123!` | Yes (`true`) | `ACTIVE` | Editorial curation, manuscript review, and book approvals (Senior Editor) |
| `admin` | Marcus Vance | `marcus.vance@bookhive.com` (`marcusv`) | `Password123!` | Yes (`true`) | `ACTIVE` | Author compliance and author request approvals/rejections (Manuscript Moderator) |
| `admin` | Elena Rostova | `elena.rostova@bookhive.com` (`elenar`) | `Password123!` | Yes (`true`) | `PENDING` | Testing pending administrator onboarding and verification states (Support Lead) |

---

## Author Accounts

*All demo author accounts use the development password:* `Password123!`

| Name | Pen Name | Email / Username | Password | Email Verified | Approval Status | Account Status | Purpose |
|---|---|---|---|---|---|---|---|
| Eleanor Vance | E. V. Sterling | `eleanor.v@lumina.com` (`eleanorv`) | `Password123!` | Yes (`true`) | Approved | `APPROVED` | Philosophy author with published book (*Beyond Good and Evil*), pending book (*Mind Over Marathon*), draft (*The Silent Grove*), and rejected manuscript (*Shadows and Echoes*) |
| Dr. Sarah Chen | Dr. Sarah Chen | `sarah.chen@writes.org` (`sarahchen`) | `Password123!` | Yes (`true`) | Approved | `APPROVED` | Science & Physics author with published book (*Cosmos and Consciousness*), pending review (*Quantum Mechanics: A Visual Guide*), and rejected submission (*Data Without Borders*) |
| Amir Hassan | A. Hassan | `amir.hassan@authorhub.com` (`amirh`) | `Password123!` | Yes (`true`) | Approved | `APPROVED` | Fiction & Business author with published books (*The Forgotten Empire*, *The Lean Startup Mindset*), pending review (*The Entrepreneur's Compass*), draft (*The Stoic CEO*), and rejected manuscript (*The Unfinished Symphony*) |
| Yuki Tanaka | Y. T. Bloom | `yuki.tanaka@writes.jp` (`yukit`) | `Password123!` | Yes (`true`) | Approved | `APPROVED` | Technology & Programming author with published books (*Silicon Dreams*, *Clean Architecture in Python*), pending review (*Designing for Humans*), and draft (*Neural Networks Demystified*) |
| Isabella Rossi | Bella R. | `i.rossi@literario.it` (`isabellaro`) | `Password123!` | Yes (`true`) | Approved | `APPROVED` | European Fiction & Design author with published books (*The Art of Stillness*, *Echoes of Tomorrow*), pending review (*Roots of History*), and draft (*Brushstrokes of Light*) |
| Julian Thorne | J. Thistle | `j.thorne@writes.org` (`jthorne`) | `Password123!` | Yes (`true`) | Pending | `PENDING` | Testing Author Studio pending state and author approval workflows |
| Noah Adeyemi | N. Adeyemi | `noah.adeyemi@writes.ng` (`noaha`) | `Password123!` | Yes (`true`) | Pending | `PENDING` | Testing Author Studio pending state and admin review queues |
| Mei Lin | Mei L. | `mei.lin@authorstudio.cn` (`meilin`) | `Password123!` | Yes (`true`) | Pending | `PENDING` | Testing Author Studio pending state with prepared manuscripts |
| Tariq Khalid | T. Khalid | `tariq.khalid@writes.ae` (`tariqk`) | `Password123!` | Yes (`true`) | Pending | `PENDING` | Testing Author Studio pending state for self-development author |
| Viktor Petrov | V. Petrov | `viktor.petrov@mail.ru` (`viktorp`) | `Password123!` | Yes (`true`) | Rejected | `REJECTED` | Testing Author Studio rejected banner, rejection reason feedback, and re-application prompts |
| Fatima Al-Zahra | F. Al-Zahra | `fatima.alzahra@writes.ma` (`fatimaz`) | `Password123!` | Yes (`true`) | Rejected | `REJECTED` | Testing Author Studio duplicate submission rejection state |

---

## Reader Accounts

*All demo reader accounts use the development password:* `Password123!`

| Name | Email / Username | Password | Email Verified | Account Status | Purpose |
|---|---|---|---|---|---|
| Liam Henderson | `liam.henderson@mail.com` (`liamh`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile, catalogue browsing, reading history, and reviews |
| Sarah Jenkins | `sarah.jenkins@mail.com` (`sarahj`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile, in-browser PDF reading, and review submissions |
| Marcus Webb | `marcus.webb@mail.com` (`marcusw`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile, bookmarking, and community discussions |
| Diana Ross | `diana.ross@mail.com` (`dianar`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile and reading progress tracking |
| Amara Osei | `amara.osei@mail.com` (`amaraos`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile and literature exploration |
| Felix Müller | `felix.muller@mail.com` (`felixm`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile and manuscript reading |
| Priya Nair | `priya.nair@mail.com` (`priyan`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile and review submissions |
| Carlos Reyes | `carlos.reyes@mail.com` (`carlosr`) | `Password123!` | Yes (`true`) | `ACTIVE` | Reader profile and category discovery |

---

## Test Scenarios Covered

The seed dataset covers genuine platform states:

1. **Active Super Admin & System Admin:** Initial administrator accounts configured via environment variables and demo staff accounts (`alexander.wright@bookhive.com`, `samantha.reed@bookhive.com`, `marcus.vance@bookhive.com`).
2. **Pending Admin:** Account with `AccountStatus.PENDING` (`elena.rostova@bookhive.com`).
3. **Approved Authors:** 5 active authors (`AccountStatus.APPROVED`) with assigned author profiles, bios, pen names, and avatar photos.
4. **Pending Authors:** 4 author applications waiting for review (`AccountStatus.PENDING`).
5. **Rejected Authors:** 2 author applications with logged rejection status (`AccountStatus.REJECTED`).
6. **Active Verified Readers:** 8 reader accounts with varied registration timestamps and active review records.
7. **Complete Manuscript Lifecycle:**
   - `PUBLISHED` (8 books with sample PDFs, page counts, covers, view/download counts, and reader reviews)
   - `PENDING_REVIEW` (5 books waiting for admin review)
   - `DRAFT` (4 manuscripts in draft state)
   - `REJECTED` (3 manuscripts with logged rejection reasons in `BookRejectionLog`)
8. **Knowledge Categories:** 10 active default categories with curated descriptions.

---

## Important Security Notes

- **Local Development Only:** These credentials are for local development, automated testing, and demonstration purposes only.
- **Never Reuse in Production:** None of these default passwords or demo email addresses should ever be deployed to a production environment.
- **No Secrets in Repository:** Real user credentials, production keys, database connection strings, JWT secrets, and SMTP credentials must never be committed to this file.
- **Production Guardrails:** Production deployments must ensure `SEED_DEMO_DATA=false` and use strong, unique passwords for `INITIAL_ADMIN_PASSWORD` and `INITIAL_SUPER_ADMIN_PASSWORD`.
- **Synchronization:** If any seed account details are modified in `data_seed.py`, this document must be updated to match the implementation.

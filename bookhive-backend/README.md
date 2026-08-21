# BookHive Backend

Simple FastAPI backend structure using this flow:

`Router -> Service -> Repository -> SQLAlchemy ORM -> PostgreSQL`

Application entry point: `main.py`

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

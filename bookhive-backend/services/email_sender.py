import asyncio
import logging
import smtplib
from email.message import EmailMessage

from config import settings

logger = logging.getLogger(__name__)


class EmailSender:
    async def send_verification_email(self, email: str, token: str) -> None:
        verification_url = (
            f"{settings.frontend_url}/auth/verification-success?token={token}"
        )

        if not settings.smtp_enabled:
            if settings.app_env.lower() == "development":
                logger.info(
                    "Development verification link for %s: %s",
                    email,
                    verification_url,
                )
                return

            raise RuntimeError("SMTP must be enabled outside development.")

        await asyncio.to_thread(
            self._send_smtp_message,
            email,
            verification_url,
        )

    def _send_smtp_message(self, recipient: str, verification_url: str) -> None:
        message = EmailMessage()
        message["Subject"] = "Verify your BookHive email address"
        message["From"] = settings.smtp_from_email
        message["To"] = recipient
        message.set_content(
            "Welcome to BookHive. Verify your email address using this link:\n\n"
            f"{verification_url}\n\n"
            "This link expires in "
            f"{settings.email_verification_token_expire_minutes} minutes."
        )

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)

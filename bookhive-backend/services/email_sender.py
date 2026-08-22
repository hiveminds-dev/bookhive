import asyncio
import logging
import smtplib
from email.message import EmailMessage

from config import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    pass


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

        self._validate_smtp_settings()

        try:
            await asyncio.to_thread(
                self._send_smtp_message,
                email,
                verification_url,
            )
        except (OSError, smtplib.SMTPException, TimeoutError) as exc:
            logger.exception("Unable to send verification email to %s", email)
            raise EmailDeliveryError(
                "The verification email could not be sent. Please try again later."
            ) from exc

    async def send_password_reset_email(self, email: str, token: str) -> None:
        reset_url = f"{settings.frontend_url}/auth/reset-password?token={token}"

        if not settings.smtp_enabled:
            if settings.app_env.lower() == "development":
                logger.info("Development password reset link for %s: %s", email, reset_url)
                return
            raise RuntimeError("SMTP must be enabled outside development.")

        self._validate_smtp_settings()
        try:
            await asyncio.to_thread(self._send_password_reset_message, email, reset_url)
        except (OSError, smtplib.SMTPException, TimeoutError) as exc:
            logger.exception("Unable to send password reset email to %s", email)
            raise EmailDeliveryError(
                "The password reset email could not be sent. Please try again later."
            ) from exc

    @staticmethod
    def _validate_smtp_settings() -> None:
        required_settings = {
            "SMTP_HOST": settings.smtp_host,
            "SMTP_USERNAME": settings.smtp_username,
            "SMTP_PASSWORD": settings.smtp_password,
            "SMTP_FROM_EMAIL": settings.smtp_from_email,
        }
        missing = [name for name, value in required_settings.items() if not value]
        if missing:
            raise EmailDeliveryError(
                "Missing SMTP configuration: " + ", ".join(missing)
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
        message.add_alternative(
            """
            <html>
              <body style="font-family:Arial,sans-serif;color:#201d18;line-height:1.6">
                <div style="max-width:560px;margin:auto;padding:32px;border:1px solid #eadfca;border-radius:16px">
                  <h1 style="color:#9a7200">Welcome to BookHive</h1>
                  <p>Please confirm your email address to finish creating your account.</p>
                  <p style="margin:28px 0">
                    <a href="{url}" style="background:#c99716;color:#fff;padding:12px 22px;text-decoration:none;border-radius:8px">
                      Verify email address
                    </a>
                  </p>
                  <p>This link expires in {minutes} minutes.</p>
                  <p style="font-size:13px;color:#6b6258">If you did not create a BookHive account, you can ignore this email.</p>
                </div>
              </body>
            </html>
            """.format(
                url=verification_url,
                minutes=settings.email_verification_token_expire_minutes,
            ),
            subtype="html",
        )

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)

    def _send_password_reset_message(self, recipient: str, reset_url: str) -> None:
        message = EmailMessage()
        message["Subject"] = "Reset your BookHive password"
        message["From"] = settings.smtp_from_email
        message["To"] = recipient
        message.set_content(
            "Reset your BookHive password using this link:\n\n"
            f"{reset_url}\n\n"
            f"This link expires in {settings.password_reset_token_expire_minutes} minutes. "
            "If you did not request a password reset, ignore this email."
        )

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)

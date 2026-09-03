import logging

import jwt
import pytest
from pydantic import ValidationError

import utils.security as sec
from config import INSECURE_SECRET_KEYS, Settings
from utils.security import create_access_token, decode_access_token

VALID_SECRET_KEY = "a_very_secure_secret_key_that_has_at_least_32_characters_12345"
VALID_32_CHAR_KEY = "12345678901234567890123456789012"  # Exactly 32 chars


class TestJwtSecretConfigurationValidation:
    """Test suite for Settings.secret_key validation."""

    def test_valid_secret_key_accepted(self) -> None:
        """A valid secret key with >= 32 characters should pass validation."""
        settings = Settings(_env_file=None, secret_key=VALID_SECRET_KEY)
        assert settings.secret_key == VALID_SECRET_KEY

        exact_32 = Settings(_env_file=None, secret_key=VALID_32_CHAR_KEY)
        assert exact_32.secret_key == VALID_32_CHAR_KEY

    @pytest.mark.parametrize(
        "empty_value",
        [
            "",
            "   ",
            "\t\n",
        ],
    )
    def test_empty_secret_key_rejected(self, empty_value: str) -> None:
        """An empty or whitespace-only secret key must be rejected."""
        with pytest.raises(ValidationError) as exc_info:
            Settings(_env_file=None, secret_key=empty_value)

        error_message = str(exc_info.value)
        assert "SECRET_KEY must not be empty" in error_message
        assert "openssl rand -hex 32" in error_message

    @pytest.mark.parametrize(
        "short_key",
        [
            "a",
            "1234567890",
            "too_short_secret_key_12345",  # 26 chars
            "1234567890123456789012345678901",  # 31 chars
        ],
    )
    def test_short_secret_key_rejected(self, short_key: str) -> None:
        """A secret key shorter than 32 characters must be rejected."""
        with pytest.raises(ValidationError) as exc_info:
            Settings(_env_file=None, secret_key=short_key)

        error_message = str(exc_info.value)
        assert "SECRET_KEY must contain at least 32 characters" in error_message
        assert "openssl rand -hex 32" in error_message

    @pytest.mark.parametrize(
        "placeholder",
        [
            "change_me",
            "changeme",
            "secret",
            "password",
            "your-secret-key",
            "replace_with_a_secure_random_secret",
            "CHANGE_ME",
            "ChangeMe",
            "SECRET",
            "PASSWORD",
            "Your-Secret-Key",
            "REPLACE_WITH_A_SECURE_RANDOM_SECRET",
            "  change_me  ",
            "  replace_with_a_secure_random_secret  ",
        ],
    )
    def test_insecure_placeholders_rejected(self, placeholder: str) -> None:
        """Known insecure placeholders must be rejected regardless of casing or whitespace."""
        with pytest.raises(ValidationError) as exc_info:
            Settings(_env_file=None, secret_key=placeholder)

        error_message = str(exc_info.value)
        assert (
            "SECRET_KEY must not use an insecure placeholder value" in error_message
            or "SECRET_KEY must contain at least 32 characters" in error_message
        )
        assert "openssl rand -hex 32" in error_message

    def test_all_listed_insecure_keys_covered(self) -> None:
        """Ensure all members of INSECURE_SECRET_KEYS are rejected."""
        for placeholder in INSECURE_SECRET_KEYS:
            with pytest.raises(ValidationError) as exc_info:
                Settings(_env_file=None, secret_key=placeholder)
            assert "openssl rand -hex 32" in str(exc_info.value)

    def test_surrounding_whitespace_handled_correctly(self) -> None:
        """Leading/trailing whitespace should be trimmed before length validation."""
        # Valid key with whitespace around it
        padded_valid = f"   {VALID_SECRET_KEY}   \n"
        settings = Settings(_env_file=None, secret_key=padded_valid)
        assert settings.secret_key == VALID_SECRET_KEY

        # Short key padded with spaces to 35 chars total: trimmed length is 10 (< 32)
        padded_short = " " * 25 + "0123456789"
        assert len(padded_short) == 35
        with pytest.raises(ValidationError) as exc_info:
            Settings(_env_file=None, secret_key=padded_short)
        assert "SECRET_KEY must contain at least 32 characters" in str(exc_info.value)

    def test_secret_value_not_leaked_in_errors_or_logs(
        self,
        caplog: pytest.LogCaptureFixture,
    ) -> None:
        """Sensitive secret key values must never be included in error messages or logs."""
        sensitive_secret = "TOP_SECRET_SENSITIVE_123"  # 24 chars (< 32)

        with caplog.at_level(logging.DEBUG):
            with pytest.raises(ValidationError) as exc_info:
                Settings(_env_file=None, secret_key=sensitive_secret)

        error_repr = str(exc_info.value)
        # Verify the raw sensitive string is not present in the error text
        assert sensitive_secret not in error_repr
        # Verify it wasn't logged
        for record in caplog.records:
            assert sensitive_secret not in record.getMessage()


class TestJwtTokenFunctionalityWithSecureSecret:
    """Test creating and decoding JWT access tokens with a valid secret key."""

    def test_valid_secret_can_create_and_decode_jwt_access_tokens(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Valid secret key should encode and decode tokens successfully."""
        test_secret = "another_super_secure_random_key_with_at_least_32_characters"
        monkeypatch.setattr(sec.settings, "secret_key", test_secret)

        token = create_access_token(user_id=42, role="reader")
        assert isinstance(token, str)
        assert len(token) > 20

        payload = decode_access_token(token)
        assert payload["sub"] == "42"
        assert payload["role"] == "reader"
        assert payload["type"] == "access"
        assert "jti" in payload
        assert "exp" in payload
        assert "iat" in payload

    def test_changing_secret_invalidates_previously_issued_tokens(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Tokens issued with one secret key must fail decoding if the secret is rotated."""
        original_secret = "original_secure_secret_key_at_least_32_characters_11111"
        rotated_secret = "new_rotated_secure_secret_key_at_least_32_characters_22222"

        monkeypatch.setattr(sec.settings, "secret_key", original_secret)
        token = create_access_token(user_id=10, role="author")

        # Verify it decodes under original secret
        payload = decode_access_token(token)
        assert payload["sub"] == "10"

        # Rotate secret key
        monkeypatch.setattr(sec.settings, "secret_key", rotated_secret)

        # Decoding should raise InvalidSignatureError (subclass of InvalidTokenError)
        with pytest.raises(jwt.InvalidTokenError):
            decode_access_token(token)

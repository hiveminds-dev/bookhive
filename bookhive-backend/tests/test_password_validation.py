import pytest
from pydantic import ValidationError

from schemas.auth import (
    ChangePasswordRequest,
    PasswordChangeOTPRequest,
    ResetPasswordRequest,
    VerifyPasswordChangeOTPRequest,
)


@pytest.mark.parametrize(
    ("schema", "payload"),
    [
        (ResetPasswordRequest, {"token": "x" * 20, "new_password": "password"}),
        (ChangePasswordRequest, {"current_password": "old", "new_password": "password"}),
        (PasswordChangeOTPRequest, {"current_password": "old", "new_password": "password"}),
        (
            VerifyPasswordChangeOTPRequest,
            {"otp_code": "123456", "current_password": "old", "new_password": "password"},
        ),
    ],
)
def test_new_password_fields_reject_weak_passwords(schema, payload):
    with pytest.raises(ValidationError, match="uppercase letter"):
        schema(**payload)


@pytest.mark.parametrize(
    ("schema", "payload"),
    [
        (ResetPasswordRequest, {"token": "x" * 20, "new_password": "NewPassword123!"}),
        (ChangePasswordRequest, {"current_password": "old", "new_password": "NewPassword123!"}),
        (PasswordChangeOTPRequest, {"current_password": "old", "new_password": "NewPassword123!"}),
        (
            VerifyPasswordChangeOTPRequest,
            {"otp_code": "123456", "current_password": "old", "new_password": "NewPassword123!"},
        ),
    ],
)
def test_new_password_fields_accept_strong_passwords(schema, payload):
    assert schema(**payload).new_password == "NewPassword123!"

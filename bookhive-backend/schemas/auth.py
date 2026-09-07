from pydantic import BaseModel, EmailStr, Field, field_validator

from schemas.password_validation import validate_password_complexity


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class AuthenticatedUserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: EmailStr
    role: str
    account_status: str
    email_verified: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: AuthenticatedUserResponse


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class MessageResponse(BaseModel):
    message: str


class EmailVerificationResponse(BaseModel):
    message: str
    role: str
    account_status: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=256)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_complexity(value)


class UpdateProfileRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_complexity(value)


class PasswordChangeOTPRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_complexity(value)


class VerifyPasswordChangeOTPRequest(BaseModel):
    otp_code: str = Field(min_length=6, max_length=6)
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_complexity(value)


class EmailCheckResponse(BaseModel):
    available: bool
    message: str | None = None

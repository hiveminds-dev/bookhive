from pydantic import BaseModel, EmailStr


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class MessageResponse(BaseModel):
    message: str


class EmailVerificationResponse(BaseModel):
    message: str
    role: str
    account_status: str

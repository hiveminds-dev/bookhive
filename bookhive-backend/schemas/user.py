from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from orm_models.user import AccountStatus, UserRole


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    account_status: AccountStatus
    email_verified: bool
    created_at: datetime
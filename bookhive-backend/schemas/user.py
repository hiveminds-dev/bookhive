from datetime import datetime

from pydantic import BaseModel

from orm_models.user import UserRole, AccountStatus


class UserCreate(BaseModel):
    id : int
    full_name : str
    email : str
    password : str
    role : UserRole
    account_status : AccountStatus
    created_at : datetime

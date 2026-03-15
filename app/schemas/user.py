from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
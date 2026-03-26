from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

# Shared User properties
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.USER

# Data required for Registration
class UserCreate(UserBase):
    password: str

# Data returned by API (hiding the password)
class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # Allows compatibility with SQLAlchemy models


## use o handle access_token and token_type
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
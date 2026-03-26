from pydantic import BaseModel
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False

class TaskCreate(TaskBase):
    pass

# --- ADD THIS CLASS ---
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class TaskOut(TaskBase):
    id: int
    owner_username: str # Ensure this matches what you use in models/logic

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
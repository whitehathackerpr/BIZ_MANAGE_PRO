from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool

    class Config:
        from_attributes = True 
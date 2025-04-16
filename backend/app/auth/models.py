from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user data"""
    email: EmailStr
    name: str
    
class UserLogin(BaseModel):
    """Login credentials"""
    email: EmailStr
    password: str
    
class UserRegistration(UserBase):
    """Registration data"""
    password: str = Field(..., min_length=8)
    
class UserResponse(UserBase):
    """User response data"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        
class TokenResponse(BaseModel):
    """Token response data"""
    access_token: str
    refresh_token: str
    token_type: str
    
class PasswordReset(BaseModel):
    """Password reset request"""
    email: EmailStr
    
class PasswordUpdate(BaseModel):
    """Password update data"""
    password: str = Field(..., min_length=8) 
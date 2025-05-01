from typing import Optional
from pydantic import BaseModel, EmailStr, constr
from datetime import datetime

class ProfileBase(BaseModel):
    first_name: Optional[constr(max_length=100)] = None
    last_name: Optional[constr(max_length=100)] = None
    phone_number: Optional[constr(max_length=20)] = None
    profile_image: Optional[str] = None
    preferences: Optional[dict] = None

class ProfileUpdate(ProfileBase):
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class Profile(ProfileBase):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProfileWithPermissions(Profile):
    permissions: dict
    assigned_branches: list = []
    owned_businesses: list = []

    class Config:
        from_attributes = True 
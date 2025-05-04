from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(owner|customer|supplier|staff)$")
    business_name: Optional[str] = None
    business_id: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['owner', 'customer', 'supplier', 'staff']
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    business_id: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    business_id: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    message: Optional[str] = None

class BusinessRegistration(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    owner_email: EmailStr
    owner_password: str = Field(..., min_length=8)
    owner_first_name: str
    owner_last_name: str
    
class CustomerRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class SupplierRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    company_name: str
    phone: str
    address: str
    
class StaffRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    business_id: str
    position: Optional[str] = "Cashier"

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetVerify(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class SessionCreate(BaseModel):
    user_id: int
    device_info: Optional[str] = None
    ip_address: Optional[str] = None

class SessionResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    expires_at: datetime
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    is_active: bool

class SessionList(BaseModel):
    sessions: List[SessionResponse] 
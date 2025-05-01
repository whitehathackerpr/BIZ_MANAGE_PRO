from typing import Optional, List
from pydantic import BaseModel, constr, confloat
from datetime import datetime

class BranchBase(BaseModel):
    name: constr(min_length=1, max_length=255)
    address: Optional[str] = None
    city: Optional[constr(max_length=100)] = None
    state: Optional[constr(max_length=100)] = None
    country: Optional[constr(max_length=100)] = None
    postal_code: Optional[constr(max_length=20)] = None
    phone: Optional[constr(max_length=20)] = None
    email: Optional[constr(max_length=255)] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool = True
    opening_hours: Optional[str] = None  # JSON string of opening hours

class BranchCreate(BranchBase):
    business_id: int
    manager_id: Optional[int] = None

class BranchUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=255)] = None
    address: Optional[str] = None
    city: Optional[constr(max_length=100)] = None
    state: Optional[constr(max_length=100)] = None
    country: Optional[constr(max_length=100)] = None
    postal_code: Optional[constr(max_length=20)] = None
    phone: Optional[constr(max_length=20)] = None
    email: Optional[constr(max_length=255)] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None
    opening_hours: Optional[str] = None
    manager_id: Optional[int] = None

class Branch(BranchBase):
    id: int
    business_id: int
    manager_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime] = None
    employee_count: int
    active_employee_count: int

    class Config:
        from_attributes = True

class BranchWithRelations(Branch):
    business: 'Business'
    manager: Optional['User'] = None
    employees: List['User'] = []
    inventory: List['Inventory'] = []

    class Config:
        from_attributes = True

# Forward references
from .business import Business
from .user import User
from .inventory import Inventory 
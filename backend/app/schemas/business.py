from typing import Optional, List
from pydantic import BaseModel, constr
from datetime import datetime

class BusinessBase(BaseModel):
    name: constr(min_length=1, max_length=255)
    description: Optional[str] = None
    registration_number: Optional[constr(max_length=100)] = None
    tax_id: Optional[constr(max_length=100)] = None
    is_active: bool = True

class BusinessCreate(BusinessBase):
    owner_id: int

class BusinessUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=255)] = None
    description: Optional[str] = None
    registration_number: Optional[constr(max_length=100)] = None
    tax_id: Optional[constr(max_length=100)] = None
    is_active: Optional[bool] = None

class Business(BusinessBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    branch_count: int
    active_branch_count: int

    class Config:
        from_attributes = True

class BusinessWithBranches(Business):
    branches: List['Branch'] = []

    class Config:
        from_attributes = True 
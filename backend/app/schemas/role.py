from typing import Optional
from pydantic import BaseModel, Field

class RoleBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None

class RoleInDBBase(RoleBase):
    id: int

    class Config:
        from_attributes = True

class Role(RoleInDBBase):
    pass

class RoleInDB(RoleInDBBase):
    pass 
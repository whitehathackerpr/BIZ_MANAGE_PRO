from typing import List, Optional, Set
from pydantic import BaseModel, Field, validator
from datetime import datetime

class PermissionBase(BaseModel):
    """
    Base permission schema with common attributes.
    
    Attributes:
        name (str): Name of the permission
        description (Optional[str]): Description of the permission
        category (Optional[str]): Category of the permission
    """
    name: str = Field(..., description="Name of the permission")
    description: Optional[str] = Field(None, description="Description of the permission")
    category: Optional[str] = Field("general", description="Category of the permission")

class PermissionCreate(PermissionBase):
    """
    Schema for creating a new permission.
    Inherits all fields from PermissionBase.
    """
    pass

class Permission(PermissionBase):
    """
    Schema for permission response.
    
    Attributes:
        id (int): Permission ID
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class RoleBase(BaseModel):
    """
    Base role schema with common attributes.
    
    Attributes:
        name (str): Name of the role
        description (Optional[str]): Description of the role
    """
    name: str = Field(..., description="Name of the role")
    description: Optional[str] = Field(None, description="Description of the role")

class RoleCreate(RoleBase):
    """
    Schema for creating a new role.
    
    Attributes:
        parent_role_ids (Optional[List[int]]): IDs of parent roles
    """
    parent_role_ids: Optional[List[int]] = Field(None, description="IDs of parent roles in the hierarchy")

class RoleUpdate(BaseModel):
    """
    Schema for updating a role.
    
    Attributes:
        name (Optional[str]): New name of the role
        description (Optional[str]): New description of the role
        parent_role_ids (Optional[List[int]]): New parent role IDs
    """
    name: Optional[str] = Field(None, description="Name of the role")
    description: Optional[str] = Field(None, description="Description of the role")
    parent_role_ids: Optional[List[int]] = Field(None, description="IDs of parent roles in the hierarchy")

class Role(RoleBase):
    """
    Schema for role response.
    
    Attributes:
        id (int): Role ID
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
        permissions (List[Permission]): List of permissions
        parent_roles (List[Role]): List of parent roles
        child_roles (List[Role]): List of child roles
        all_permissions (Set[str]): Set of all permissions including inherited ones
    """
    id: int
    created_at: datetime
    updated_at: datetime
    permissions: List[Permission] = []
    parent_roles: List['Role'] = []
    child_roles: List['Role'] = []
    all_permissions: Set[str] = set()

    class Config:
        orm_mode = True

    @validator('all_permissions', pre=True)
    def set_all_permissions(cls, v, values):
        """
        Validator to compute all permissions including inherited ones.
        """
        if 'permissions' in values and 'parent_roles' in values:
            permissions = set(p.name for p in values['permissions'])
            for parent_role in values['parent_roles']:
                permissions.update(parent_role.all_permissions)
            return permissions
        return set()

# Update forward reference for Role
Role.update_forward_refs() 
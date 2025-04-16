from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import role as crud_role
from app.schemas import role as schemas_role
from app.api import deps
from app.core.logging import logger
from app.models.user import User

router = APIRouter()

@router.get("/roles", response_model=List[schemas_role.Role])
async def get_roles(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all roles.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of roles with their permissions and hierarchy
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    roles = crud_role.get_roles(db, skip=skip, limit=limit)
    logger.info(f"Retrieved {len(roles)} roles")
    return roles

@router.get("/roles/{role_id}", response_model=schemas_role.Role)
async def get_role(
    role_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get role by ID.
    
    Args:
        role_id: ID of the role to retrieve
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Role details with permissions and hierarchy
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role

@router.post("/roles", response_model=schemas_role.Role)
async def create_role(
    *,
    db: Session = Depends(deps.get_db),
    role_in: schemas_role.RoleCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create new role.
    
    Args:
        db: Database session
        role_in: Role data to create
        current_user: Current authenticated user
        
    Returns:
        Created role with permissions and hierarchy
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role_by_name(db, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A role with this name already exists."
        )
    role = crud_role.create_role(db, role_in=role_in)
    logger.info(f"Created new role: {role.name}")
    return role

@router.put("/roles/{role_id}", response_model=schemas_role.Role)
async def update_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    role_in: schemas_role.RoleUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update a role.
    
    Args:
        db: Database session
        role_id: ID of the role to update
        role_in: Updated role data
        current_user: Current authenticated user
        
    Returns:
        Updated role with permissions and hierarchy
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Check if updated name already exists
    if role_in.name and role_in.name != role.name:
        existing_role = crud_role.get_role_by_name(db, name=role_in.name)
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A role with this name already exists."
            )
    
    role = crud_role.update_role(db, role=role, role_in=role_in)
    logger.info(f"Updated role: {role.name}")
    return role

@router.delete("/roles/{role_id}", response_model=schemas_role.Role)
async def delete_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Delete a role.
    
    Args:
        db: Database session
        role_id: ID of the role to delete
        current_user: Current authenticated user
        
    Returns:
        Deleted role
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    role = crud_role.delete_role(db, role=role)
    logger.info(f"Deleted role: {role.name}")
    return role

@router.get("/permissions", response_model=List[schemas_role.Permission])
async def get_permissions(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all permissions.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of permissions
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    permissions = crud_role.get_permissions(db, skip=skip, limit=limit)
    logger.info(f"Retrieved {len(permissions)} permissions")
    return permissions

@router.post("/permissions", response_model=schemas_role.Permission)
async def create_permission(
    *,
    db: Session = Depends(deps.get_db),
    permission_in: schemas_role.PermissionCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Create new permission.
    
    Args:
        db: Database session
        permission_in: Permission data to create
        current_user: Current authenticated user
        
    Returns:
        Created permission
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    permission = crud_role.get_permission_by_name(db, name=permission_in.name)
    if permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A permission with this name already exists."
        )
    permission = crud_role.create_permission(db, permission_in=permission_in)
    logger.info(f"Created new permission: {permission.name}")
    return permission

@router.post("/roles/{role_id}/permissions/{permission_id}")
async def assign_permission(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    permission_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Assign a permission to a role.
    
    Args:
        db: Database session
        role_id: ID of the role
        permission_id: ID of the permission to assign
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    permission = crud_role.get_permission(db, permission_id=permission_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    crud_role.assign_permission(db, role=role, permission=permission)
    logger.info(f"Assigned permission {permission.name} to role {role.name}")
    return {"msg": "Permission assigned successfully"}

@router.delete("/roles/{role_id}/permissions/{permission_id}")
async def remove_permission(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    permission_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Remove a permission from a role.
    
    Args:
        db: Database session
        role_id: ID of the role
        permission_id: ID of the permission to remove
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    permission = crud_role.get_permission(db, permission_id=permission_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    crud_role.remove_permission(db, role=role, permission=permission)
    logger.info(f"Removed permission {permission.name} from role {role.name}")
    return {"msg": "Permission removed successfully"}

@router.post("/roles/{role_id}/parent/{parent_id}")
async def add_parent_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    parent_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Add a parent role to establish hierarchy.
    
    Args:
        db: Database session
        role_id: ID of the child role
        parent_id: ID of the parent role to add
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    parent_role = crud_role.get_role(db, role_id=parent_id)
    if not parent_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent role not found"
        )
    crud_role.add_parent_role(db, role=role, parent_role=parent_role)
    logger.info(f"Added parent role {parent_role.name} to role {role.name}")
    return {"msg": "Parent role added successfully"}

@router.delete("/roles/{role_id}/parent/{parent_id}")
async def remove_parent_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    parent_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Remove a parent role from hierarchy.
    
    Args:
        db: Database session
        role_id: ID of the child role
        parent_id: ID of the parent role to remove
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    parent_role = crud_role.get_role(db, role_id=parent_id)
    if not parent_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent role not found"
        )
    crud_role.remove_parent_role(db, role=role, parent_role=parent_role)
    logger.info(f"Removed parent role {parent_role.name} from role {role.name}")
    return {"msg": "Parent role removed successfully"} 
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ....core.logging import logger
from ....dependencies import get_db, get_current_active_superuser
from ....models.permission import Permission
from ....schemas.permission import PermissionCreate, PermissionUpdate, Permission as PermissionSchema

router = APIRouter()

@router.get("/", response_model=List[PermissionSchema])
async def get_permissions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve permissions.
    """
    permissions = db.query(Permission).offset(skip).limit(limit).all()
    return permissions

@router.post("/", response_model=PermissionSchema)
async def create_permission(
    *,
    db: Session = Depends(get_db),
    permission_in: PermissionCreate,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Create new permission.
    """
    permission = db.query(Permission).filter(Permission.name == permission_in.name).first()
    if permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The permission with this name already exists in the system.",
        )
    permission = Permission(
        name=permission_in.name,
        description=permission_in.description,
        category=permission_in.category,
    )
    db.add(permission)
    db.commit()
    db.refresh(permission)
    logger.info(f"Permission created: {permission.name}")
    return permission

@router.get("/{permission_id}", response_model=PermissionSchema)
async def get_permission(
    *,
    db: Session = Depends(get_db),
    permission_id: int,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Get permission by ID.
    """
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )
    return permission

@router.put("/{permission_id}", response_model=PermissionSchema)
async def update_permission(
    *,
    db: Session = Depends(get_db),
    permission_id: int,
    permission_in: PermissionUpdate,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a permission.
    """
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )
    
    # Check if updated name already exists
    if permission_in.name and permission_in.name != permission.name:
        existing_permission = db.query(Permission).filter(Permission.name == permission_in.name).first()
        if existing_permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The permission with this name already exists in the system.",
            )
    
    # Update permission attributes
    for field, value in permission_in.dict(exclude_unset=True).items():
        setattr(permission, field, value)
    
    db.add(permission)
    db.commit()
    db.refresh(permission)
    logger.info(f"Permission updated: {permission.name}")
    return permission

@router.delete("/{permission_id}", response_model=PermissionSchema)
async def delete_permission(
    *,
    db: Session = Depends(get_db),
    permission_id: int,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a permission.
    """
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found",
        )
    db.delete(permission)
    db.commit()
    logger.info(f"Permission deleted: {permission.name}")
    return permission 
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ....core.logging import logger
from ....dependencies import get_db, get_current_active_superuser
from ....models.role import Role
from ....schemas.role import RoleCreate, RoleUpdate, Role as RoleSchema

router = APIRouter()

@router.get("/", response_model=List[RoleSchema])
async def get_roles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve roles.
    """
    roles = db.query(Role).offset(skip).limit(limit).all()
    return roles

@router.post("/", response_model=RoleSchema)
async def create_role(
    *,
    db: Session = Depends(get_db),
    role_in: RoleCreate,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Create new role.
    """
    role = db.query(Role).filter(Role.name == role_in.name).first()
    if role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The role with this name already exists in the system.",
        )
    role = Role(
        name=role_in.name,
        description=role_in.description,
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    logger.info(f"Role created: {role.name}")
    return role

@router.get("/{role_id}", response_model=RoleSchema)
async def get_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Get role by ID.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    return role

@router.put("/{role_id}", response_model=RoleSchema)
async def update_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    role_in: RoleUpdate,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a role.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    
    # Check if updated name already exists
    if role_in.name and role_in.name != role.name:
        existing_role = db.query(Role).filter(Role.name == role_in.name).first()
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The role with this name already exists in the system.",
            )
    
    # Update role attributes
    for field, value in role_in.dict(exclude_unset=True).items():
        setattr(role, field, value)
    
    db.add(role)
    db.commit()
    db.refresh(role)
    logger.info(f"Role updated: {role.name}")
    return role

@router.delete("/{role_id}", response_model=RoleSchema)
async def delete_role(
    *,
    db: Session = Depends(get_db),
    role_id: int,
    current_user: Any = Depends(get_current_active_superuser),
) -> Any:
    """
    Delete a role.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    db.delete(role)
    db.commit()
    logger.info(f"Role deleted: {role.name}")
    return role 
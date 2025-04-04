from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import or_

from ..models import Role, Permission, Employee, EmployeeTimeLog, User
from ..extensions import get_db
from ..utils.decorators import admin_required
from ..utils.validation import validate_role_data

router = APIRouter()

# Pydantic models
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_system: bool = False

class RoleCreate(RoleBase):
    permission_ids: Optional[List[int]] = None

class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    permissions: List[Permission]

    class Config:
        from_attributes = True

class PermissionBase(BaseModel):
    name: str
    description: str
    category: str = "general"

class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TimeLogBase(BaseModel):
    check_in: datetime
    check_out: Optional[datetime] = None
    notes: Optional[str] = None

# Routes
@router.get("/roles", response_model=List[RoleResponse])
async def get_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    query = db.query(Role)
    
    if search:
        query = query.filter(Role.name.ilike(f'%{search}%'))
    
    roles = query.order_by(Role.name.asc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return roles

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    # Validate role data
    errors = validate_role_data(role.dict())
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Check if role name already exists
    if db.query(Role).filter_by(name=role.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name already exists"
        )
    
    # Create role
    db_role = Role(
        name=role.name,
        description=role.description,
        is_system=role.is_system
    )
    
    # Add permissions
    if role.permission_ids:
        permissions = db.query(Permission).filter(
            Permission.id.in_(role.permission_ids)
        ).all()
        db_role.permissions = permissions
    
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    
    return db_role

@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role

@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role_update: RoleBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    db_role = db.query(Role).get(role_id)
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Prevent modifying system roles
    if db_role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify system roles"
        )
    
    # Validate role data
    errors = validate_role_data(role_update.dict(), partial=True)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Update role fields
    if role_update.name != db_role.name:
        if db.query(Role).filter_by(name=role_update.name).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists"
            )
        db_role.name = role_update.name
    
    if role_update.description is not None:
        db_role.description = role_update.description
    
    db.commit()
    db.refresh(db_role)
    
    return db_role

@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Prevent deleting system roles
    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system roles"
        )
    
    # Check if role is assigned to any users
    if role.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete role that is assigned to users"
        )
    
    db.delete(role)
    db.commit()
    
    return {"message": "Role deleted successfully"}

@router.get("/roles/{role_id}/permissions", response_model=List[PermissionResponse])
async def get_role_permissions(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role.permissions

@router.put("/roles/{role_id}/permissions")
async def update_role_permissions(
    role_id: int,
    permission_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    role = db.query(Role).get(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Prevent modifying system roles
    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify system roles"
        )
    
    # Get permissions
    permissions = db.query(Permission).filter(
        Permission.id.in_(permission_ids)
    ).all()
    
    # Update role permissions
    role.permissions = permissions
    db.commit()
    
    return {
        "message": "Role permissions updated successfully",
        "permissions": permissions
    }

@router.get("/permissions", response_model=List[PermissionResponse])
async def get_permissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    query = db.query(Permission)
    
    if search:
        query = query.filter(
            or_(
                Permission.name.ilike(f'%{search}%'),
                Permission.description.ilike(f'%{search}%')
            )
        )
    if category:
        query = query.filter_by(category=category)
    
    permissions = query.order_by(Permission.name.asc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return permissions

@router.post("/permissions", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
async def create_permission(
    permission: PermissionBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    # Check if permission name already exists
    if db.query(Permission).filter_by(name=permission.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permission name already exists"
        )
    
    # Create permission
    db_permission = Permission(
        name=permission.name,
        description=permission.description,
        category=permission.category
    )
    
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    
    return db_permission

@router.get("/permissions/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    permission = db.query(Permission).get(permission_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    return permission

@router.put("/permissions/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: int,
    permission_update: PermissionBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    db_permission = db.query(Permission).get(permission_id)
    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
    # Update permission fields
    if permission_update.name != db_permission.name:
        if db.query(Permission).filter_by(name=permission_update.name).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission name already exists"
            )
        db_permission.name = permission_update.name
    
    db_permission.description = permission_update.description
    db_permission.category = permission_update.category
    
    db.commit()
    db.refresh(db_permission)
    
    return db_permission

@router.delete("/permissions/{permission_id}")
async def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    permission = db.query(Permission).get(permission_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
    db.delete(permission)
    db.commit()
    
    return {"message": "Permission deleted successfully"}

@router.post("/employees/{employee_id}/time-logs", response_model=TimeLogBase)
async def check_in(
    employee_id: int,
    time_log: TimeLogBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).get(employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Create time log
    db_time_log = EmployeeTimeLog(
        employee_id=employee_id,
        check_in=time_log.check_in,
        notes=time_log.notes
    )
    
    db.add(db_time_log)
    db.commit()
    db.refresh(db_time_log)
    
    return db_time_log

@router.post("/employees/{employee_id}/time-logs/{log_id}/check-out")
async def check_out(
    employee_id: int,
    log_id: int,
    check_out_time: datetime,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_log = db.query(EmployeeTimeLog).get(log_id)
    if not time_log or time_log.employee_id != employee_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )
    
    time_log.check_out = check_out_time
    db.commit()
    
    return {"message": "Check-out recorded successfully"}

@router.get("/employees/{employee_id}/time-logs", response_model=List[TimeLogBase])
async def get_time_logs(
    employee_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).get(employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    query = db.query(EmployeeTimeLog).filter_by(employee_id=employee_id)
    
    if start_date:
        query = query.filter(EmployeeTimeLog.check_in >= start_date)
    if end_date:
        query = query.filter(EmployeeTimeLog.check_in <= end_date)
    
    time_logs = query.order_by(EmployeeTimeLog.check_in.desc()).all()
    
    return time_logs 
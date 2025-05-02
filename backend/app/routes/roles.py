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
from app.schemas.permission import Permission

router = APIRouter(prefix="/roles", tags=["roles"])

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
@router.get("/", response_model=List[RoleResponse])
async def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all roles"""
    if not current_user.has_permission("role:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    db_roles = db.query(Role).all()
    return [RoleResponse.from_orm(role) for role in db_roles]

@router.post("/", response_model=RoleResponse)
async def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new role"""
    if not current_user.has_permission("role:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_role = Role(name=role.name, description=role.description)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return RoleResponse.from_orm(db_role)

@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role: RoleBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a role"""
    if not current_user.has_permission("role:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_role = db.query(Role).filter(Role.id == role_id).first()
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
    errors = validate_role_data(role.dict(), partial=True)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Update role fields
    if role.name != db_role.name:
        if db.query(Role).filter_by(name=role.name).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists"
            )
        db_role.name = role.name
    
    if role.description is not None:
        db_role.description = role.description
    
    db.commit()
    db.refresh(db_role)
    
    return RoleResponse.from_orm(db_role)

@router.delete("/{role_id}")
async def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a role"""
    if not current_user.has_permission("role:delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Prevent deleting system roles
    if db_role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system roles"
        )
    
    # Check if role is assigned to any users
    if db_role.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete role that is assigned to users"
        )
    
    db.delete(db_role)
    db.commit()
    
    return {"message": "Role deleted successfully"}

@router.get("/permissions", response_model=List[PermissionResponse])
async def get_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all permissions"""
    if not current_user.has_permission("permission:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    db_permissions = db.query(Permission).all()
    return [PermissionResponse.from_orm(p) for p in db_permissions]

@router.post("/{role_id}/permissions")
async def assign_permissions(
    role_id: int,
    permission_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign permissions to a role"""
    if not current_user.has_permission("permission:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_role = db.query(Role).filter(Role.id == role_id).first()
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
    
    # Get permissions
    permissions = db.query(Permission).filter(
        Permission.id.in_(permission_ids)
    ).all()
    
    # Update role permissions
    db_role.permissions = permissions
    db.commit()
    
    return {
        "message": "Permissions assigned successfully",
        "permissions": permissions
    }

@router.get("/{role_id}/permissions", response_model=List[PermissionResponse])
async def get_role_permissions(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get permissions for a specific role"""
    if not current_user.has_permission("permission:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    return [PermissionResponse.from_orm(p) for p in db_role.permissions]

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
from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

from ..models import User, UserProfile, Role, Permission
from ..extensions import get_db
from ..utils.decorators import admin_required
from ..utils.validation import validate_user_data
from ..utils.notifications import create_notification

router = APIRouter()

# Pydantic models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    role_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserProfileBase(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    profile: Optional[UserProfileBase] = None

    class Config:
        from_attributes = True

class UsersResponse(BaseModel):
    users: List[UserResponse]
    total: int
    pages: int
    current_page: int

class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None

class PermissionResponse(PermissionBase):
    id: int

    class Config:
        from_attributes = True

# Routes
@router.get("/users", response_model=UsersResponse)
async def get_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    query = db.query(User)
    
    if search:
        query = query.filter(
            or_(
                User.username.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%'),
                User.first_name.ilike(f'%{search}%'),
                User.last_name.ilike(f'%{search}%')
            )
        )
    if role:
        query = query.join(Role).filter(Role.name == role)
    if status:
        query = query.filter(User.is_active == (status == 'active'))
    
    users = query.order_by(User.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()
    
    total = query.count()
    
    return {
        "users": users,
        "total": total,
        "pages": (total + per_page - 1) // per_page,
        "current_page": page
    }

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    # Validate user data
    errors = validate_user_data(user.dict())
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Check if email already exists
    if db.query(User).filter_by(email=user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if db.query(User).filter_by(username=user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    db_user = User(
        username=user.username,
        email=user.email,
        password=generate_password_hash(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active,
        role_id=user.role_id
    )
    
    # Create user profile
    profile = UserProfile(
        user=db_user,
        phone=None,
        address=None,
        city=None,
        state=None,
        country=None,
        postal_code=None,
        avatar_url=None
    )
    
    db.add(db_user)
    db.add(profile)
    db.commit()
    db.refresh(db_user)
    
    # Create welcome notification
    await create_notification(
        user_id=db_user.id,
        title="Welcome",
        message="Welcome to the system! Please complete your profile.",
        type="system"
    )
    
    return db_user

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Allow users to view their own profile or admins to view any profile
    if current_user.id != user_id:
        user = db.query(User).get(user_id)
        if not user or not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access"
            )
    
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Allow users to update their own profile or admins to update any profile
    if current_user.id != user_id:
        user = db.query(User).get(user_id)
        if not user or not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access"
            )
    
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate user data
    errors = validate_user_data(user_update.dict(), partial=True)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Update user fields
    if user_update.username != user.username:
        if db.query(User).filter_by(username=user_update.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        user.username = user_update.username
    
    if user_update.email != user.email:
        if db.query(User).filter_by(email=user_update.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        user.email = user_update.email
    
    if user_update.first_name is not None:
        user.first_name = user_update.first_name
    if user_update.last_name is not None:
        user.last_name = user_update.last_name
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.role_id is not None:
        user.role_id = user_update.role_id
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting the last admin
    if user.is_admin and db.query(User).filter_by(is_admin=True).count() == 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last admin user"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/users/{user_id}/profile", response_model=UserProfileBase)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Allow users to view their own profile or admins to view any profile
    if current_user.id != user_id:
        user = db.query(User).get(user_id)
        if not user or not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access"
            )
    
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user.profile if user.profile else {}

@router.put("/users/{user_id}/profile", response_model=UserProfileBase)
async def update_user_profile(
    user_id: int,
    profile_update: UserProfileBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Allow users to update their own profile or admins to update any profile
    if current_user.id != user_id:
        user = db.query(User).get(user_id)
        if not user or not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access"
            )
    
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.profile:
        profile = user.profile
        for key, value in profile_update.dict(exclude_unset=True).items():
            setattr(profile, key, value)
    else:
        profile = UserProfile(
            user=user,
            **profile_update.dict(exclude_unset=True)
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/users/{user_id}/permissions", response_model=List[PermissionResponse])
async def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user.permissions

@router.put("/users/{user_id}/permissions", response_model=List[PermissionResponse])
async def update_user_permissions(
    user_id: int,
    permissions: List[PermissionBase],
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Clear existing permissions
    user.permissions = []
    
    # Add new permissions
    for permission_data in permissions:
        permission = db.query(Permission).filter_by(name=permission_data.name).first()
        if permission:
            user.permissions.append(permission)
    
    db.commit()
    db.refresh(user)
    return user.permissions

@router.get("/users/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/users/me/password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.check_password(current_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    current_user.set_password(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"} 
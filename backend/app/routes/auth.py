from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta, UTC
from sqlalchemy.orm import Session
from ..models import User, Role
from ..extensions import get_db
from ..utils.email import send_password_reset_email
from ..utils.security import generate_reset_token, verify_reset_token
from ..utils.auth import get_current_user
from ..core.config import get_settings
from ..auth.jwt import create_access_token, create_refresh_token, verify_token

router = APIRouter(tags=["Authentication"])
settings = get_settings()

# Models
class UserBase(BaseModel):
    email: str
    name: str
    role: str
    password: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    roles: List[str] = []
    is_active: bool = True

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    id: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# Routes
@router.post("/login", response_model=Token)
async def login(
    form_data: LoginRequest,
    db: Session = Depends(get_db)
):
    print(f"Login attempt for email: {form_data.email}")  # Debug log
    
    user = db.query(User).filter(User.email == form_data.email).first()
    
    if not user:
        print(f"User not found for email: {form_data.email}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"User found: {user.email}, is_active: {user.is_active}")  # Debug log
    
    if not user.check_password(form_data.password):
        print("Password check failed")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        print("User account is deactivated")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Update last login
    user.updated_at = datetime.now(UTC)
    db.commit()
    
    # Create proper JWT tokens
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    # Get user roles
    roles = [role.name for role in user.roles]
    
    print(f"Login successful for user: {user.email}")  # Debug log
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "roles": roles
        }
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    try:
        print(f"Received registration request: {user.dict()}")  # Debug log
        
        # Validate email format
        if not user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Validate password
        if not user.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )
        
        # Validate role
        if not user.role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is required"
            )
        
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Get or create role
        role = db.query(Role).filter(Role.name == user.role).first()
        if not role:
            role = Role(name=user.role)
            db.add(role)
            db.commit()
            db.refresh(role)
        
        # Create new user
        db_user = User(
            email=user.email,
            full_name=user.name,
            is_active=True
        )
        db_user.set_password(user.password)
        db_user.roles.append(role)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        print(f"Successfully created user: {db_user.id}")  # Debug log
        
        # Format response according to UserResponse model
        response_data = {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.full_name,
            "role": user.role,
            "password": user.password,  # Include the password in the response
            "is_superuser": db_user.is_superuser,
            "created_at": db_user.created_at,
            "updated_at": db_user.updated_at,
            "roles": [role.name for role in db_user.roles],
            "is_active": db_user.is_active
        }
        
        return response_data
        
    except HTTPException as he:
        print(f"HTTP Exception: {he.detail}")  # Debug log
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    try:
        # Refresh user data from database
        db.refresh(current_user)
        
        # Get user roles
        roles = [role.name for role in current_user.roles]
        
        return {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.full_name,
            "role": roles[0] if roles else None,
            "password": "",  # Don't return password
            "is_superuser": current_user.is_superuser,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
            "roles": roles,
            "is_active": current_user.is_active
        }
    except Exception as e:
        print(f"Error getting current user: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user information"
        )

@router.post("/logout")
async def logout_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Logout user"""
    return {"message": "Successfully logged out"}

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(
    user_update: UserBase,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.email != current_user.email:
        if db.query(User).filter(User.email == user_update.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    if user_update.name != current_user.full_name:
        current_user.full_name = user_update.name
    
    current_user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    request: Request,
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

@router.post("/refresh", response_model=Token)
async def refresh_token_route(request: Request, db: Session = Depends(get_db)):
    """Generate a new access token using the refresh token"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create new tokens
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/reset-password-request")
async def reset_password_request(
    request: Request,
    db: Session = Depends(get_db)
):
    data = await request.json()
    email = data.get('email')
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email is required"
        )
    
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        token = generate_reset_token(user.id)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
        await send_password_reset_email(user.email, reset_url)
        
        return {"message": "Password reset instructions sent to your email"}
    
    # Always return success to avoid user enumeration
    return {"message": "If your email is registered, you will receive a password reset link"}

@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    user_id = verify_reset_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.set_password(new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.get("/verify-email/{token}")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    user_id = verify_reset_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": "Email verified successfully"} 
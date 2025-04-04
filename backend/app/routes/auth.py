from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta, UTC
from sqlalchemy.orm import Session
from ..models import User
from ..extensions import get_db
from ..utils.email import send_password_reset_email
from ..utils.security import generate_reset_token, verify_reset_token
from ..utils.auth import get_current_user
from app.config import get_settings

router = APIRouter()
settings = get_settings()

# Import JWT functions
from main import create_access_token, create_refresh_token, verify_token

# Models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Routes
@router.post("/login", response_model=Token)
async def login(
    form_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not user.check_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Update last login
    user.last_login = datetime.now(UTC)
    db.commit()
    
    # Create proper JWT tokens
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    db_user = User(
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone
    )
    db_user.set_password(user.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/me", response_model=UserResponse)
async def get_current_user_route(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    return current_user

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
    
    if user_update.username != current_user.username:
        if db.query(User).filter(User.username == user_update.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username
    
    current_user.first_name = user_update.first_name
    current_user.last_name = user_update.last_name
    current_user.phone = user_update.phone
    
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
    email: EmailStr,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        token = generate_reset_token(user.id)
        reset_url = f"{settings.frontend_url}/reset-password/{token}"
        await send_password_reset_email(user.email, reset_url)
        
        return {"message": "Password reset instructions sent to your email"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Email not found"
    )

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
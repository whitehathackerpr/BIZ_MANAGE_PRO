from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File
from sqlalchemy.orm import Session
from app.auth.jwt import (
    create_access_token, create_refresh_token, decode_token, decode_refresh_token,
    create_access_token_from_data, create_refresh_token_from_data,
    ACCESS_TOKEN_TYPE, REFRESH_TOKEN_TYPE
)
from app.auth.dependencies import get_current_user
from app.extensions import get_db
from app.models import User
from app.auth.models import (
    UserLogin, UserRegistration, UserResponse, 
    TokenResponse, PasswordReset, PasswordUpdate
)
from app.auth.utils import verify_password, get_password_hash, generate_password_reset_token, verify_password_reset_token
from datetime import datetime, UTC
import os
from app.config import settings
from app.models import Role

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegistration,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.email.split('@')[0],  # Generate username from email
        hashed_password=hashed_password,
        full_name=user_data.name,
        is_active=True,
        created_at=datetime.now(UTC)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Return user data
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        name=new_user.full_name,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    user.updated_at = datetime.now(UTC)
    db.commit()
    
    # Create tokens using the backward compatible method
    access_token = create_access_token_from_data({
        "sub": str(user.id),
        "email": user.email,
        "is_superuser": user.is_superuser,
        "is_active": user.is_active
    })
    
    refresh_token = create_refresh_token_from_data({
        "sub": str(user.id),
        "email": user.email
    })
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    try:
        # Use the specialized decode_refresh_token function
        payload = decode_refresh_token(refresh_token)
        user_id = payload.get("user_id") or payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Handle both numeric user_id and string user_id
        user_id_value = user_id if isinstance(user_id, int) else int(user_id)
        user = db.query(User).filter(User.id == user_id_value).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Create new tokens using the backward compatible method
        new_access_token = create_access_token_from_data({
            "sub": str(user.id),
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_active": user.is_active
        })
        
        new_refresh_token = create_refresh_token_from_data({
            "sub": str(user.id),
            "email": user.email
        })
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.post("/password-reset")
async def request_password_reset(
    email_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    user = db.query(User).filter(User.email == email_data.email).first()
    
    # Always return success to avoid user enumeration
    if user:
        token = generate_password_reset_token(user)
        # TODO: Send password reset email with token
        # send_password_reset_email(user, token)
    
    return {"message": "If your email is registered, you will receive a password reset link"}

@router.post("/password-reset/{token}", response_model=UserResponse)
async def reset_password(
    token: str,
    password_data: PasswordUpdate,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    # Verify token and get user
    user = verify_password_reset_token(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    # Update password
    hashed_password = get_password_hash(password_data.password)
    user.hashed_password = hashed_password
    
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.post("/logout")
async def logout():
    """Logout endpoint (client-side only, just for API completeness)"""
    # JWT is stateless, actual logout happens on client side
    # This endpoint is for API completeness
    return {"message": "Successfully logged out"}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload avatar for current user"""
    # TODO: Implement file validation, processing, and storage
    # This is placeholder implementation
    
    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    avatar_path = f"{settings.UPLOAD_DIR}/avatar_{current_user.id}.jpg"
    
    # Save file
    try:
        contents = await file.read()
        with open(avatar_path, "wb") as f:
            f.write(contents)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not upload file"
        )
    finally:
        await file.close()
    
    # Update user avatar path in database
    # current_user.avatar = avatar_path
    # db.commit()
    
    return {"message": "Avatar uploaded successfully"} 
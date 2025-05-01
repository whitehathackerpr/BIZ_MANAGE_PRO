from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.jwt import create_access_token, create_refresh_token, get_current_user
from app.core.exceptions import UnauthorizedException
from app.core.cache import cache
from app.core.logging import logger
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Token, TokenPayload, UserCreate, UserResponse
from app.schemas.user import User as UserSchema
from app.core.config import settings
from app.crud import user as crud
from app.api import deps
from app.core import security
from app.core.security import get_password_hash
from app.utils import (
    generate_password_reset_token,
    verify_password_reset_token,
    send_reset_password_email,
)

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = crud.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
        
    # Create access and refresh tokens
    access_token = create_access_token(
        subject=user.email,
        user_id=user.id,
        email=user.email,
        is_superuser=user.is_admin,
        is_active=user.is_active,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = create_refresh_token(
        subject=user.email,
        user_id=user.id,
        email=user.email,
        is_superuser=user.is_admin,
        is_active=user.is_active,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
async def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register new user.
    """
    user = crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )
    user = crud.create(db, obj_in=user_in)
    
    logger.info(f"New user registered: {user.email}")
    
    return user

@router.get("/me", response_model=UserSchema)
async def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/refresh", response_model=Token)
async def refresh_token(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Refresh access token.
    """
    # Create new tokens
    access_token = create_access_token(
        subject=current_user.email,
        user_id=current_user.id,
        email=current_user.email,
        is_superuser=current_user.is_admin,
        is_active=current_user.is_active,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = create_refresh_token(
        subject=current_user.email,
        user_id=current_user.id,
        email=current_user.email,
        is_superuser=current_user.is_admin,
        is_active=current_user.is_active,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update own user.
    """
    user = crud.update(db, db_obj=current_user, obj_in=user_in)
    return user

@router.post("/password-reset", response_model=schemas.Msg)
def request_password_reset(
    email: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Password recovery.
    """
    user = crud.get_by_email(db, email=email)
    if user:
        password_reset_token = generate_password_reset_token(email=email)
        send_reset_password_email(
            email_to=user.email, token=password_reset_token, username=user.full_name
        )
    return {"msg": "Password reset email sent"}

@router.post("/reset-password", response_model=schemas.Msg)
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset password.
    """
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid token",
        )
    user = crud.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Inactive user",
        )
    hashed_password = get_password_hash(new_password)
    user.password_hash = hashed_password
    db.add(user)
    db.commit()
    return {"msg": "Password updated successfully"} 
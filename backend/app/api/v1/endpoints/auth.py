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

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    db: Session = Depends(get_db),
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
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
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
    db: Session = Depends(get_db),
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
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update own user.
    """
    user = crud.update(db, db_obj=current_user, obj_in=user_in)
    return user 
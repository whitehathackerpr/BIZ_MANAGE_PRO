from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ...core.security import create_access_token, verify_password
from ...core.exceptions import UnauthorizedException
from ...core.cache import cache
from ...core.logging import logger
from ...dependencies import get_db, get_current_user
from ...models.user import User
from ...schemas.auth import Token, TokenPayload, UserCreate, UserResponse
from ...schemas.user import User as UserSchema
from ...core import security
from ...core.config import settings
from ...crud import user as crud

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
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
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
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return {
        "access_token": security.create_access_token(
            current_user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(
            current_user.id, expires_delta=refresh_token_expires
        ),
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
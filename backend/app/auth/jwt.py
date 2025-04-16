from datetime import datetime, timedelta, UTC
from typing import Optional, Dict, Any, Union
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

# OAuth2 password bearer scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Token payload model
class TokenPayload(BaseModel):
    sub: str
    exp: float
    iat: float
    type: str
    user_id: int
    email: Optional[EmailStr] = None
    is_superuser: bool = False
    is_active: bool = True

# Define token types
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"

def create_token(
    subject: Union[str, int],
    token_type: str,
    expires_delta: Optional[timedelta] = None,
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    is_superuser: bool = False,
    is_active: bool = True,
) -> str:
    """
    Create a JWT token
    
    Args:
        subject: User identifier (typically email)
        token_type: Token type (access or refresh)
        expires_delta: Optional custom expiration time
        user_id: User ID
        email: User email
        is_superuser: Whether user is a superuser
        is_active: Whether user is active
        
    Returns:
        str: JWT token
    """
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        if token_type == ACCESS_TOKEN_TYPE:
            expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        else:
            expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "sub": str(subject),
        "exp": expire.timestamp(),
        "iat": datetime.now(UTC).timestamp(),
        "type": token_type,
        "user_id": user_id,
        "email": email,
        "is_superuser": is_superuser,
        "is_active": is_active,
    }
    
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_access_token(
    subject: Union[str, int],
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    is_superuser: bool = False,
    is_active: bool = True,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create an access token for a user"""
    return create_token(
        subject=subject,
        token_type=ACCESS_TOKEN_TYPE,
        expires_delta=expires_delta,
        user_id=user_id,
        email=email,
        is_superuser=is_superuser,
        is_active=is_active,
    )

def create_refresh_token(
    subject: Union[str, int],
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    is_superuser: bool = False,
    is_active: bool = True,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a refresh token for a user"""
    return create_token(
        subject=subject,
        token_type=REFRESH_TOKEN_TYPE,
        expires_delta=expires_delta,
        user_id=user_id,
        email=email,
        is_superuser=is_superuser,
        is_active=is_active,
    )

def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token
    
    Args:
        token: JWT token to decode
        
    Returns:
        dict: Token payload
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Get the current authenticated user from token
    
    Args:
        db: Database session
        token: JWT token
        
    Returns:
        User: Authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        payload = decode_token(token)
        token_type = payload.get("type")
        
        # Ensure we're using an access token
        if token_type != ACCESS_TOKEN_TYPE:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user_id",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    return user

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current authenticated superuser
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Authenticated superuser
        
    Raises:
        HTTPException: If user is not a superuser
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user 
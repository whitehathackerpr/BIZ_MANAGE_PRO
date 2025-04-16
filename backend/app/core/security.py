from datetime import datetime, timedelta
from typing import Any, Union
from passlib.context import CryptContext
from fastapi import HTTPException, status

# Import JWT functions from our custom implementation
from app.auth.jwt import (
    create_access_token as jwt_create_access_token,
    create_refresh_token as jwt_create_refresh_token,
    decode_token as jwt_decode_token,
    get_current_user,
    get_current_active_superuser
)

# Password context for hashing and verifying passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None, **kwargs
) -> str:
    """
    Create a JWT access token
    
    This is a wrapper around the jwt.create_access_token function
    to maintain backward compatibility
    """
    return jwt_create_access_token(
        subject=subject,
        expires_delta=expires_delta,
        **kwargs
    )

def create_refresh_token(
    subject: Union[str, Any], expires_delta: timedelta = None, **kwargs
) -> str:
    """
    Create a JWT refresh token
    
    This is a wrapper around the jwt.create_refresh_token function
    to maintain backward compatibility
    """
    return jwt_create_refresh_token(
        subject=subject,
        expires_delta=expires_delta,
        **kwargs
    )

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify that a password matches a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash"""
    return pwd_context.hash(password)

def verify_token(token: str) -> dict:
    """
    Verify a JWT token
    
    This is a wrapper around the jwt.decode_token function
    to maintain backward compatibility
    """
    return jwt_decode_token(token) 
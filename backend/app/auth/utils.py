from passlib.context import CryptContext
from fastapi import HTTPException, status
import secrets
from datetime import datetime, timedelta, UTC
from app.config import settings
from app.models import User
from sqlalchemy.orm import Session
from typing import Optional

# Password context for hashing and verification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash a password for storing"""
    return pwd_context.hash(password)

def generate_password_reset_token(user: User) -> str:
    """Generate a secure random token for password reset"""
    token = secrets.token_urlsafe(32)
    # In a real application, you would store this token in the database
    # with an expiration time, associating it with the user
    return token

def verify_password_reset_token(token: str, db: Session) -> Optional[User]:
    """Verify a password reset token and return the user if valid"""
    # In a real application, you would look up the token in the database
    # check if it's expired, and return the associated user if valid
    # This is a placeholder implementation
    
    # For testing/demo purposes, always return None to indicate invalid token
    # In a real app, we would implement proper token verification
    return None 
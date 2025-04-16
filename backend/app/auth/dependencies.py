from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.extensions import get_db
from app.models import User
from app.auth.jwt import get_current_user as jwt_get_current_user

async def get_current_user(
    current_user: User = Depends(jwt_get_current_user)
) -> User:
    """
    Get the current authenticated user based on the JWT token.
    This is a FastAPI dependency for protected routes.
    """
    return current_user

async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current authenticated admin user.
    This is a FastAPI dependency for admin-only routes.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return current_user 
from functools import wraps
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from ..models import User
from ..extensions import get_db
from .auth import get_current_user

def admin_required():
    """
    Dependency to ensure only administrators can access a route.
    
    Returns:
        function: The dependency function
    """
    def dependency(current_user: User = Depends(get_current_user)):
        if not current_user or not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required"
            )
        return current_user
    
    return dependency

def role_required(roles: list):
    """
    Dependency to ensure only users with specific roles can access a route.
    
    Args:
        roles (list): List of allowed roles
        
    Returns:
        function: The dependency function
    """
    def dependency(current_user: User = Depends(get_current_user)):
        if not current_user or current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    
    return dependency

def branch_required():
    """
    Dependency to ensure only users with branch access can access a route.
    
    Returns:
        function: The dependency function
    """
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if not current_user.branch:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Branch access required"
            )
        return current_user
    
    return dependency 
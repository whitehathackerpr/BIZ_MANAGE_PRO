from itsdangerous import URLSafeTimedSerializer
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional

from app.config import get_settings
from app.models import User
from ..extensions import get_db

# Initialize settings
settings = get_settings()

def generate_password_reset_token(user_id: int) -> str:
    """Generate a password reset token for a user."""
    s = URLSafeTimedSerializer(settings.secret_key)
    return s.dumps(str(user_id), salt='password-reset-salt')

def verify_password_reset_token(token: str) -> Optional[int]:
    """Verify a password reset token and return the user ID."""
    s = URLSafeTimedSerializer(settings.secret_key)
    try:
        user_id = s.loads(token, salt='password-reset-salt', max_age=3600)
        return int(user_id)
    except:
        return None

def get_token_from_header(request: Request) -> str:
    """Extract the JWT token from the Authorization header."""
    authorization = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current user from the JWT token.
    This function requires a valid JWT token.
    """
    from main import verify_token  # Import here to avoid circular imports
    
    try:
        # Get the token from the authorization header
        token = get_token_from_header(request)
        
        # Verify the token
        payload = verify_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get the user ID from the token
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Query the user from the database
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled"
            )
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get the current user, but return None if not authenticated.
    This function doesn't require a valid JWT token.
    """
    try:
        return await get_current_user(request, db)
    except HTTPException:
        return None
# JWT Authentication Standardization Plan

## Current Issues

1. Multiple JWT implementations found:
   - One in `main.py` using `jwt` package directly
   - Another in `auth.py` using `jose.jwt`
   - Inconsistent token expiration settings
   - No refresh token mechanism

2. Missing implementation for database access in authentication routes:
   - Many TODO comments in auth.py related to user retrieval and validation
   - No proper error handling for authentication failures

## Implementation Plan

### 1. Select JWT Package

We will standardize on `fastapi-jwt-auth` because:
- It's designed specifically for FastAPI
- It provides built-in refresh token support
- It has automatic token expiration handling
- It includes integration with FastAPI's dependency injection system

### 2. Update Requirements

Add to requirements.txt:
```
fastapi-jwt-auth==0.5.0
```

### 3. Create Authentication Module

Create a new module structure:

```
backend/
  app/
    auth/
      __init__.py
      jwt.py       # JWT configuration and utilities
      models.py    # Authentication models
      routes.py    # Authentication routes
      utils.py     # Helper functions
      dependencies.py  # Dependency functions for auth
```

### 4. Implementation Details

#### app/auth/jwt.py

```python
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi import Request, HTTPException
from starlette.responses import JSONResponse
from pydantic import BaseModel
from datetime import timedelta
from app.config import settings

# JWT Configuration model
class JWTSettings(BaseModel):
    authjwt_secret_key: str = settings.JWT_SECRET_KEY
    authjwt_token_location: set = {"headers"}
    authjwt_access_token_expires: timedelta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    authjwt_refresh_token_expires: timedelta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    authjwt_cookie_csrf_protect: bool = False
    authjwt_cookie_secure: bool = settings.ENVIRONMENT != "development"

# Callback to get JWT configuration
@AuthJWT.load_config
def get_config():
    return JWTSettings()

# Exception handler for JWT errors
def jwt_exception_handler(request: Request, exc: AuthJWTException):
    return JSONResponse(
        status_code=401,
        content={"detail": str(exc)}
    )

# Functions to create, refresh, and verify tokens
def create_tokens(auth_jwt: AuthJWT, user_id: int, email: str):
    """Create access and refresh tokens for a user"""
    # Create access token
    access_token = auth_jwt.create_access_token(
        subject=str(user_id),
        user_claims={"email": email}
    )
    
    # Create refresh token
    refresh_token = auth_jwt.create_refresh_token(
        subject=str(user_id)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
```

#### app/auth/dependencies.py

```python
from fastapi import Depends, HTTPException, status
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

async def get_current_user(
    auth_jwt: AuthJWT = Depends(),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user based on the JWT token.
    This is a FastAPI dependency for protected routes.
    """
    auth_jwt.jwt_required()
    
    user_id = auth_jwt.get_jwt_subject()
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current authenticated admin user.
    This is a FastAPI dependency for admin-only routes.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return current_user
```

#### app/auth/routes.py

```python
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.auth.jwt import create_tokens
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.auth.models import (
    UserLogin, UserRegistration, UserResponse, 
    TokenResponse, PasswordReset, PasswordUpdate
)
from app.auth.utils import verify_password, get_password_hash
from app.core.security import send_password_reset_email
from datetime import datetime

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
        name=user_data.name,
        hashed_password=hashed_password,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    auth_jwt: AuthJWT = Depends(),
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
    
    # Create tokens
    tokens = create_tokens(auth_jwt, user.id, user.email)
    return tokens

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    auth_jwt: AuthJWT = Depends(),
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    auth_jwt.jwt_refresh_token_required()
    
    user_id = auth_jwt.get_jwt_subject()
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    tokens = create_tokens(auth_jwt, user.id, user.email)
    return tokens

@router.post("/password-reset", status_code=status.HTTP_204_NO_CONTENT)
async def request_password_reset(
    email_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    user = db.query(User).filter(User.email == email_data.email).first()
    if user:
        # Send password reset email
        send_password_reset_email(user)
    # Always return success to prevent email enumeration
    return {"status": "success"}

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
            detail="Invalid token"
        )
    
    # Update password
    hashed_password = get_password_hash(password_data.password)
    user.hashed_password = hashed_password
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return user
```

#### app/auth/models.py

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user data"""
    email: EmailStr
    name: str
    
class UserLogin(BaseModel):
    """Login credentials"""
    email: EmailStr
    password: str
    
class UserRegistration(UserBase):
    """Registration data"""
    password: str = Field(..., min_length=8)
    
class UserResponse(UserBase):
    """User response data"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        
class TokenResponse(BaseModel):
    """Token response data"""
    access_token: str
    refresh_token: str
    token_type: str
    
class PasswordReset(BaseModel):
    """Password reset request"""
    email: EmailStr
    
class PasswordUpdate(BaseModel):
    """Password update data"""
    password: str = Field(..., min_length=8)
```

### 5. Application Integration

In main.py, register the exception handler and include the new auth router:

```python
from fastapi import FastAPI
from app.auth.jwt import jwt_exception_handler
from fastapi_jwt_auth.exceptions import AuthJWTException

# Create FastAPI app
app = FastAPI()

# Register exception handler
app.add_exception_handler(AuthJWTException, jwt_exception_handler)

# Import and include auth router
from app.auth.routes import router as auth_router
app.include_router(auth_router)
```

### 6. Update Settings

Update app/config.py to include JWT settings:

```python
class Settings:
    # ... existing settings ...
    
    # JWT Settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
```

### 7. Update Environment Variables

Add to .env.example:

```
JWT_SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Testing Plan

1. Unit tests for authentication functions
2. Integration tests for auth endpoints
3. Manual testing of login, token refresh, and protected routes

## Migration Steps

1. Install fastapi-jwt-auth
2. Implement the new authentication module
3. Update main.py to use the new implementation
4. Remove old JWT code from main.py and auth.py
5. Update all routes that use the old JWT authentication
6. Test all authentication flows 
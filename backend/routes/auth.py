from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    avatar: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    # TODO: Get user from database
    user = None  # Replace with actual database query
    if user is None:
        raise credentials_exception
    return user

# Routes
@router.post("/register", response_model=User)
async def register(user: UserCreate):
    # TODO: Check if user exists
    # TODO: Create user in database
    hashed_password = get_password_hash(user.password)
    # TODO: Save user with hashed password
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # TODO: Get user from database
    user = None  # Replace with actual database query
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=User)
async def update_user(
    user_update: UserBase,
    current_user: User = Depends(get_current_user)
):
    # TODO: Update user in database
    return current_user

@router.post("/password-reset")
async def request_password_reset(email: EmailStr):
    # TODO: Generate reset token and send email
    return {"message": "Password reset email sent"}

@router.post("/password-reset/{token}")
async def reset_password(token: str, new_password: str):
    # TODO: Verify token and update password
    return {"message": "Password updated successfully"}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # TODO: Save avatar file and update user
    return {"message": "Avatar uploaded successfully"}

@router.delete("/account")
async def delete_account(current_user: User = Depends(get_current_user)):
    # TODO: Delete user account
    return {"message": "Account deleted successfully"} 
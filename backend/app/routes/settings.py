from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import os
from werkzeug.utils import secure_filename

from ..models import User, Business, SystemSetting
from ..extensions import get_db
from ..utils.email import send_email

router = APIRouter()

# Pydantic models
class UserProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BusinessSettingsBase(BaseModel):
    business_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_id: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None

class BusinessSettingsResponse(BusinessSettingsBase):
    pass

class SystemSettingsBase(BaseModel):
    dark_mode: Optional[bool] = None
    email_notifications: Optional[bool] = None
    two_factor_auth: Optional[bool] = None

class SystemSettingsResponse(SystemSettingsBase):
    pass

# Routes
@router.get("/users/me", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/users/me", response_model=UserProfileResponse)
async def update_user_profile(
    profile_update: UserProfileBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update basic info
    if profile_update.first_name is not None:
        current_user.first_name = profile_update.first_name
    if profile_update.last_name is not None:
        current_user.last_name = profile_update.last_name
    if profile_update.email is not None:
        if db.query(User).filter(User.email == profile_update.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = profile_update.email
    if profile_update.phone is not None:
        current_user.phone = profile_update.phone

    # Handle password change if provided
    if profile_update.current_password and profile_update.new_password:
        if not current_user.check_password(profile_update.current_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        current_user.set_password(profile_update.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/users/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not avatar.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file selected"
        )

    if not allowed_file(avatar.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type"
        )

    try:
        filename = secure_filename(avatar.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        
        # Ensure upload directory exists
        upload_dir = os.path.join("uploads", "avatars")
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, unique_filename)
        with open(file_path, "wb") as buffer:
            content = await avatar.read()
            buffer.write(content)
        
        # Update user's avatar URL
        current_user.avatar_url = f"/uploads/avatars/{unique_filename}"
        db.commit()
        
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": current_user.avatar_url
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/business", response_model=BusinessSettingsResponse)
async def get_business_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    business = db.query(Business).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business settings not found"
        )
    return business

@router.put("/business", response_model=BusinessSettingsResponse)
async def update_business_settings(
    settings_update: BusinessSettingsBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    business = db.query(Business).first()
    if not business:
        business = Business()
        db.add(business)

    for key, value in settings_update.dict(exclude_unset=True).items():
        setattr(business, key, value)

    db.commit()
    db.refresh(business)
    return business

@router.get("/system", response_model=SystemSettingsResponse)
async def get_system_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(SystemSetting).filter_by(user_id=current_user.id).first()
    if not settings:
        settings = SystemSetting(user_id=current_user.id)
        db.add(settings)
        db.commit()

    return settings

@router.put("/system", response_model=SystemSettingsResponse)
async def update_system_settings(
    settings_update: SystemSettingsBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(SystemSetting).filter_by(user_id=current_user.id).first()
    if not settings:
        settings = SystemSetting(user_id=current_user.id)
        db.add(settings)

    for key, value in settings_update.dict(exclude_unset=True).items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings

@router.delete("/users/me")
async def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Send confirmation email
        await send_email(
            subject="Account Deletion Confirmation",
            recipients=[current_user.email],
            body="Your account has been successfully deleted. We're sorry to see you go!"
        )
        
        # Delete user's data
        db.delete(current_user)
        db.commit()
        
        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

def allowed_file(filename: str) -> bool:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS 
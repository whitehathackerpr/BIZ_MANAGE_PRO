from fastapi import APIRouter, Depends, HTTPException, status
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel

from ..models import NotificationSetting, User
from ..extensions import get_db

router = APIRouter()

# Pydantic models
class NotificationSettingsBase(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    in_app_notifications: bool = True
    low_stock_alerts: bool = True
    order_updates: bool = True
    system_alerts: bool = True

class NotificationSettingsResponse(NotificationSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Routes
@router.get("/notification-settings", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = NotificationSetting.get_or_create(current_user.id)
    return settings

@router.put("/notification-settings", response_model=NotificationSettingsResponse)
async def update_notification_settings(
    settings_update: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = NotificationSetting.get_or_create(current_user.id)
    
    # Validate settings data
    if not isinstance(settings_update, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid settings data"
        )
    
    # Update settings
    settings.update_from_dict(settings_update)
    db.commit()
    db.refresh(settings)
    
    return settings

@router.post("/notification-settings/reset", response_model=NotificationSettingsResponse)
async def reset_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = NotificationSetting.get_or_create(current_user.id)
    
    # Reset to default values
    settings.email_notifications = True
    settings.push_notifications = True
    settings.in_app_notifications = True
    settings.low_stock_alerts = True
    settings.order_updates = True
    settings.system_alerts = True
    
    db.commit()
    db.refresh(settings)
    
    return settings 
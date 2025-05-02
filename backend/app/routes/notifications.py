from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..models import User
from ..services.notification_service import NotificationService
from ..extensions import get_db
from ..utils.decorators import admin_required

router = APIRouter()

# Pydantic models
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"

class NotificationCreate(NotificationBase):
    target_type: str = "all"
    user_ids: Optional[List[int]] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationsResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    pages: int
    current_page: int

# Routes
@router.get("/notifications", response_model=NotificationsResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = NotificationService.get_notifications(
        user_id=current_user.id,
        page=page,
        per_page=per_page,
        unread_only=unread_only
    )
    
    return {
        "notifications": notifications.items,
        "total": notifications.total,
        "pages": notifications.pages,
        "current_page": notifications.page
    }

@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = NotificationService.get_notification(notification_id, current_user.id)
    return notification

@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = NotificationService.mark_as_read(notification_id, current_user.id)
    return notification

@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = NotificationService.mark_all_as_read(current_user.id)
    return {"message": f"{count} notifications marked as read"}

@router.get("/notifications/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = NotificationService.get_unread_count(current_user.id)
    return {"count": count}

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    NotificationService.delete_notification(notification_id, current_user.id)
    return {"message": "Notification deleted successfully"}

@router.delete("/notifications/clear-all")
async def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = NotificationService.clear_all_notifications(current_user.id)
    return {"message": f"{count} notifications cleared successfully"}

@router.post("/notifications/send", response_model=List[NotificationResponse])
async def send_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not notification.title or not notification.message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and message are required"
        )
    
    if notification.target_type == "all":
        notifications = NotificationService.create_system_notification(
            notification.title,
            notification.message
        )
    elif notification.target_type == "admins":
        notifications = NotificationService.create_admin_notification(
            notification.title,
            notification.message
        )
    elif notification.target_type == "users" and notification.user_ids:
        notifications = NotificationService.create_bulk_notifications(
            notification.user_ids,
            notification.title,
            notification.message
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target type or missing user IDs"
        )
    
    return notifications 
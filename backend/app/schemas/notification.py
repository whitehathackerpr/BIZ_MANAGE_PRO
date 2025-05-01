from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    ORDER_STATUS = "order_status"
    PAYMENT_STATUS = "payment_status"
    SYSTEM = "system"
    TASK = "task"
    ALERT = "alert"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"

class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    data: Optional[dict] = None
    target_users: Optional[list[int]] = None
    target_roles: Optional[list[str]] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    read_at: Optional[datetime] = None

class Notification(NotificationBase):
    id: int
    status: NotificationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

class NotificationPreferences(BaseModel):
    email_enabled: bool = True
    push_enabled: bool = True
    sms_enabled: bool = False
    notification_types: dict[NotificationType, bool] = {
        NotificationType.LOW_STOCK: True,
        NotificationType.OUT_OF_STOCK: True,
        NotificationType.ORDER_STATUS: True,
        NotificationType.PAYMENT_STATUS: True,
        NotificationType.SYSTEM: True,
        NotificationType.TASK: True,
        NotificationType.ALERT: True
    }
    minimum_priority: NotificationPriority = NotificationPriority.LOW

    class Config:
        from_attributes = True 
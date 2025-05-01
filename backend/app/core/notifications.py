from typing import Optional, List
from sqlalchemy.orm import Session
from app import models, schemas
from app.core.config import settings
from app.core.email import send_email
from app.core.celery import celery_app
from datetime import datetime

async def send_notification(
    notification: models.Notification,
    db: Session
) -> None:
    """
    Send notification through configured channels.
    """
    # Get target users
    target_users = []
    if notification.target_users:
        target_users = db.query(models.User).filter(
            models.User.id.in_(notification.target_users)
        ).all()
    
    if notification.target_roles:
        role_users = db.query(models.User).filter(
            models.User.role.in_(notification.target_roles)
        ).all()
        target_users.extend(role_users)
    
    # Remove duplicates
    target_users = list(set(target_users))
    
    # Send notifications based on user preferences
    for user in target_users:
        preferences = get_user_notification_preferences(db, user.id)
        
        if should_send_notification(notification, preferences):
            # Send through enabled channels
            if preferences.email_enabled:
                send_email_notification.delay(
                    user_id=user.id,
                    notification_id=notification.id
                )
            
            if preferences.push_enabled:
                send_push_notification.delay(
                    user_id=user.id,
                    notification_id=notification.id
                )
            
            if preferences.sms_enabled:
                send_sms_notification.delay(
                    user_id=user.id,
                    notification_id=notification.id
                )

def get_user_notification_preferences(
    db: Session,
    user_id: int
) -> schemas.NotificationPreferences:
    """
    Get user notification preferences.
    """
    preferences = db.query(models.NotificationPreferences).filter(
        models.NotificationPreferences.user_id == user_id
    ).first()
    
    if not preferences:
        # Return default preferences
        return schemas.NotificationPreferences()
    
    return schemas.NotificationPreferences.from_orm(preferences)

def should_send_notification(
    notification: models.Notification,
    preferences: schemas.NotificationPreferences
) -> bool:
    """
    Check if notification should be sent based on preferences.
    """
    # Check if notification type is enabled
    if not preferences.notification_types.get(notification.type, True):
        return False
    
    # Check priority threshold
    priority_levels = {
        schemas.NotificationPriority.LOW: 0,
        schemas.NotificationPriority.MEDIUM: 1,
        schemas.NotificationPriority.HIGH: 2,
        schemas.NotificationPriority.URGENT: 3
    }
    
    if priority_levels[notification.priority] < priority_levels[preferences.minimum_priority]:
        return False
    
    return True

@celery_app.task
def send_email_notification(user_id: int, notification_id: int):
    """
    Send notification via email.
    """
    # Implementation depends on email service configuration
    pass

@celery_app.task
def send_push_notification(user_id: int, notification_id: int):
    """
    Send notification via push notification service.
    """
    # Implementation depends on push notification service configuration
    pass

@celery_app.task
def send_sms_notification(user_id: int, notification_id: int):
    """
    Send notification via SMS.
    """
    # Implementation depends on SMS service configuration
    pass

@celery_app.task
def check_low_stock_alerts():
    """
    Periodic task to check for low stock and create notifications.
    """
    from app.db.session import SessionLocal
    
    db = SessionLocal()
    try:
        # Get all inventory items with low stock
        low_stock_items = db.query(models.Inventory).filter(
            models.Inventory.is_low_stock()
        ).all()
        
        for item in low_stock_items:
            # Create notification for each low stock item
            notification = models.Notification(
                type=schemas.NotificationType.LOW_STOCK,
                title=f"Low Stock Alert: {item.product.name}",
                message=f"Product {item.product.name} is running low on stock at {item.branch.name}. "
                        f"Current quantity: {item.quantity}, Reorder point: {item.reorder_point}",
                priority=schemas.NotificationPriority.HIGH,
                data={
                    "product_id": item.product_id,
                    "branch_id": item.branch_id,
                    "quantity": item.quantity,
                    "reorder_point": item.reorder_point
                },
                target_roles=[models.UserRole.OWNER, models.UserRole.BRANCH_MANAGER]
            )
            db.add(notification)
        
        db.commit()
    finally:
        db.close()

@celery_app.task
def check_out_of_stock_alerts():
    """
    Periodic task to check for out of stock items and create notifications.
    """
    from app.db.session import SessionLocal
    
    db = SessionLocal()
    try:
        # Get all out of stock items
        out_of_stock_items = db.query(models.Inventory).filter(
            models.Inventory.quantity == 0
        ).all()
        
        for item in out_of_stock_items:
            # Create notification for each out of stock item
            notification = models.Notification(
                type=schemas.NotificationType.OUT_OF_STOCK,
                title=f"Out of Stock Alert: {item.product.name}",
                message=f"Product {item.product.name} is out of stock at {item.branch.name}.",
                priority=schemas.NotificationPriority.URGENT,
                data={
                    "product_id": item.product_id,
                    "branch_id": item.branch_id
                },
                target_roles=[models.UserRole.OWNER, models.UserRole.BRANCH_MANAGER]
            )
            db.add(notification)
        
        db.commit()
    finally:
        db.close() 
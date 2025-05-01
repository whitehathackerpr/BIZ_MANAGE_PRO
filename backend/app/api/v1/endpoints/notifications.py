from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_user
from app.core.notifications import send_notification

router = APIRouter()

@router.get("/", response_model=List[schemas.Notification])
def get_notifications(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: schemas.NotificationStatus = None,
    type: schemas.NotificationType = None,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve notifications.
    """
    notifications = crud.notification.get_user_notifications(
        db=db,
        user_id=current_user.id,
        status=status,
        type=type,
        skip=skip,
        limit=limit
    )
    return notifications

@router.get("/unread", response_model=List[schemas.Notification])
def get_unread_notifications(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get unread notifications.
    """
    notifications = crud.notification.get_user_notifications(
        db=db,
        user_id=current_user.id,
        status=schemas.NotificationStatus.UNREAD
    )
    return notifications

@router.post("/", response_model=schemas.Notification)
def create_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_in: schemas.NotificationCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new notification.
    """
    if not current_user.has_permission("manage_notifications"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    notification = crud.notification.create_with_owner(
        db=db,
        obj_in=notification_in,
        created_by=current_user.id
    )
    
    # Send notification in background
    background_tasks.add_task(
        send_notification,
        notification=notification,
        db=db
    )
    
    return notification

@router.put("/{notification_id}", response_model=schemas.Notification)
def update_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    notification_in: schemas.NotificationUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update notification.
    """
    notification = crud.notification.get(db=db, id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )
    
    # Only allow updating own notifications or if has manage permissions
    if notification.target_users and current_user.id not in notification.target_users and \
       not current_user.has_permission("manage_notifications"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    notification = crud.notification.update(
        db=db,
        db_obj=notification,
        obj_in=notification_in
    )
    return notification

@router.delete("/{notification_id}", response_model=schemas.Notification)
def delete_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete notification.
    """
    notification = crud.notification.get(db=db, id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )
    
    if not current_user.has_permission("manage_notifications"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    notification = crud.notification.remove(db=db, id=notification_id)
    return notification

@router.post("/{notification_id}/read", response_model=schemas.Notification)
def mark_notification_as_read(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark notification as read.
    """
    notification = crud.notification.get(db=db, id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )
    
    # Only allow marking own notifications as read
    if notification.target_users and current_user.id not in notification.target_users:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    notification = crud.notification.mark_as_read(
        db=db,
        notification_id=notification_id
    )
    return notification

@router.post("/read-all", response_model=List[schemas.Notification])
def mark_all_notifications_as_read(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Mark all notifications as read.
    """
    notifications = crud.notification.mark_all_as_read(
        db=db,
        user_id=current_user.id
    )
    return notifications

@router.get("/preferences", response_model=schemas.NotificationPreferences)
def get_notification_preferences(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get notification preferences.
    """
    preferences = crud.notification.get_preferences(
        db=db,
        user_id=current_user.id
    )
    return preferences

@router.put("/preferences", response_model=schemas.NotificationPreferences)
def update_notification_preferences(
    *,
    db: Session = Depends(deps.get_db),
    preferences_in: schemas.NotificationPreferences,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update notification preferences.
    """
    preferences = crud.notification.update_preferences(
        db=db,
        user_id=current_user.id,
        preferences=preferences_in
    )
    return preferences 
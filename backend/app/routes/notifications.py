from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Set, Any
import json
from datetime import datetime
import asyncio
from pydantic import BaseModel, Field
import logging

from ..db.session import get_db
from ..models import User, Notification, Business
from ..auth.dependencies import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Store active websocket connections
# Structure: {
#     "user:{user_id}": [websocket1, websocket2, ...],
#     "business:{business_id}": [websocket1, websocket2, ...],
#     "role:{role}": [websocket1, websocket2, ...],
# }
active_connections: Dict[str, List[WebSocket]] = {}

# Pydantic models
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"

class NotificationCreate(NotificationBase):
    target_type: str = "all"
    user_ids: Optional[List[int]] = None
    recipient_id: int
    recipient_type: str = Field(..., pattern="^(user|business|role)$")
    notification_type: str = Field(..., pattern="^(info|warning|error|success)$")
    related_object_id: Optional[str] = None
    related_object_type: Optional[str] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    recipient_id: int
    recipient_type: str
    notification_type: str
    related_object_id: Optional[str] = None
    related_object_type: Optional[str] = None

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

@router.websocket("/ws/{client_type}/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_type: str,
    client_id: str
):
    if client_type not in ["user", "business", "role"]:
        await websocket.close(code=1008, reason="Invalid client type")
        return
    
    # Accept the connection
    await websocket.accept()
    
    # Create connection key
    connection_key = f"{client_type}:{client_id}"
    
    # Store the connection
    if connection_key not in active_connections:
        active_connections[connection_key] = []
    active_connections[connection_key].append(websocket)
    
    try:
        # Send initial connected message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": f"Connected to {client_type} {client_id}"
        }))
        
        # Keep the connection alive
        while True:
            # Wait for messages (can be used for ping/pong)
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Handle message if needed
                if message.get('type') == 'ping':
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
            except json.JSONDecodeError:
                # Ignore invalid JSON
                pass
            
    except WebSocketDisconnect:
        # Remove connection when client disconnects
        active_connections[connection_key].remove(websocket)
        if not active_connections[connection_key]:
            del active_connections[connection_key]

@router.post("/notifications", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new notification and send it to connected WebSocket clients"""
    # Check if recipient exists based on type
    if notification.recipient_type == "user":
        recipient = db.query(User).filter(User.id == notification.recipient_id).first()
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient user not found"
            )
    elif notification.recipient_type == "business":
        recipient = db.query(Business).filter(Business.id == notification.recipient_id).first()
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient business not found"
            )
    elif notification.recipient_type == "role":
        # For role-based notifications, we don't need to check the role existence
        # as it will be sent to all users with that role
        pass
    
    # Create notification in database
    db_notification = Notification(
        recipient_id=notification.recipient_id,
        recipient_type=notification.recipient_type,
        title=notification.title,
        content=notification.message,
        notification_type=notification.notification_type,
        is_read=False,
        created_at=datetime.utcnow(),
        related_object_id=notification.related_object_id,
        related_object_type=notification.related_object_type
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Prepare notification data for WebSocket
    notification_data = {
        "type": "notification",
        "id": db_notification.id,
        "title": db_notification.title,
        "content": db_notification.content,
        "notification_type": db_notification.notification_type,
        "created_at": db_notification.created_at.isoformat(),
        "related_object_id": db_notification.related_object_id,
        "related_object_type": db_notification.related_object_type
    }
    
    # Send notification to connected clients
    connection_key = f"{notification.recipient_type}:{notification.recipient_id}"
    if connection_key in active_connections:
        for connection in active_connections[connection_key]:
            try:
                await connection.send_text(json.dumps(notification_data))
            except Exception as e:
                logger.error(f"Error sending notification to websocket: {str(e)}")
    
    return db_notification

@router.get("/notifications/user/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for a user"""
    # Check authorization
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these notifications"
        )
    
    # Build query
    query = db.query(Notification).filter(
        Notification.recipient_type == "user",
        Notification.recipient_id == user_id
    )
    
    # Add filter for unread notifications if requested
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Get notifications with pagination
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return notifications

@router.get("/notifications/business/{business_id}", response_model=List[NotificationResponse])
async def get_business_notifications(
    business_id: str,
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for a business"""
    # Check authorization - only business owners or admins can view business notifications
    # For simplicity, we're not checking if current_user is the owner of this business
    if current_user.role != "owner" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these notifications"
        )
    
    # Build query
    query = db.query(Notification).filter(
        Notification.recipient_type == "business",
        Notification.recipient_id == business_id
    )
    
    # Add filter for unread notifications if requested
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Get notifications with pagination
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return notifications

@router.get("/notifications/role/{role}", response_model=List[NotificationResponse])
async def get_role_notifications(
    role: str,
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for a role"""
    # Check authorization - users can only view notifications for their role
    if current_user.role != role and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these notifications"
        )
    
    # Build query
    query = db.query(Notification).filter(
        Notification.recipient_type == "role",
        Notification.recipient_id == role
    )
    
    # Add filter for unread notifications if requested
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Get notifications with pagination
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return notifications

@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    # Get notification
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check authorization
    if notification.recipient_type == "user" and notification.recipient_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this notification"
        )
    
    # For role or business notifications, check if user belongs to that role/business
    if notification.recipient_type == "role" and notification.recipient_id != current_user.role and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this notification"
        )
    
    # Update notification
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return notification

@router.put("/notifications/user/{user_id}/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_user_notifications_as_read(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications for a user as read"""
    # Check authorization
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update these notifications"
        )
    
    # Update all unread notifications for the user
    db.query(Notification).filter(
        Notification.recipient_type == "user",
        Notification.recipient_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return None

# Helper function to send notifications (can be called from other parts of the application)
async def send_notification(
    recipient_type: str,
    recipient_id: Any,
    title: str,
    content: str,
    notification_type: str = "info",
    related_object_id: Optional[str] = None,
    related_object_type: Optional[str] = None,
    db: Session = None
):
    """Send a notification to a recipient"""
    # Create notification in database
    if db:
        db_notification = Notification(
            recipient_id=recipient_id,
            recipient_type=recipient_type,
            title=title,
            content=content,
            notification_type=notification_type,
            is_read=False,
            created_at=datetime.utcnow(),
            related_object_id=related_object_id,
            related_object_type=related_object_type
        )
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        notification_id = db_notification.id
    else:
        # If no db session provided, generate a temporary ID
        notification_id = -1
    
    # Prepare notification data
    notification_data = {
        "type": "notification",
        "id": notification_id,
        "title": title,
        "content": content,
        "notification_type": notification_type,
        "created_at": datetime.utcnow().isoformat(),
        "related_object_id": related_object_id,
        "related_object_type": related_object_type
    }
    
    # Send to connected clients
    connection_key = f"{recipient_type}:{recipient_id}"
    if connection_key in active_connections:
        for connection in active_connections[connection_key]:
            try:
                await connection.send_text(json.dumps(notification_data))
            except Exception as e:
                logger.error(f"Error sending notification to websocket: {str(e)}")
    
    return True 
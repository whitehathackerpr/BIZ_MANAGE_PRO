from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_login import current_user
from app import socketio, db
from app.models.notification import Notification

@socketio.on('connect')
def handle_connect():
    if not current_user.is_authenticated:
        return False
    
    # Join user's personal room
    join_room(f'user_{current_user.id}')
    
    # Join admin room if user is admin
    if current_user.is_admin:
        join_room('admin_room')
    
    # Send unread notifications count
    unread_count = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).count()
    
    emit('unread_count', {'count': unread_count})

@socketio.on('disconnect')
def handle_disconnect():
    if current_user.is_authenticated:
        leave_room(f'user_{current_user.id}')
        if current_user.is_admin:
            leave_room('admin_room')

def send_notification(user_id, notification_data):
    """Send notification to specific user."""
    room = f'user_{user_id}'
    socketio.emit('notification', notification_data, room=room)

def broadcast_admin_notification(notification_data):
    """Broadcast notification to all admin users."""
    socketio.emit('admin_notification', notification_data, room='admin_room') 
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import emit, join_room, leave_room
from ..extensions import socketio
from ..models import User, Notification, ChatMessage
from ..utils.decorators import admin_required

websocket_bp = Blueprint('websocket', __name__)

@socketio.on('connect')
@jwt_required()
def handle_connect():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user:
        # Join user's personal room for notifications
        join_room(f'user_{current_user_id}')
        
        # Join admin room if user is admin
        if user.is_admin:
            join_room('admin')
        
        # Join general room for system updates
        join_room('general')
        
        emit('connected', {
            'message': 'Connected successfully',
            'user_id': current_user_id,
            'is_admin': user.is_admin
        })

@socketio.on('disconnect')
def handle_disconnect():
    current_user_id = get_jwt_identity()
    
    # Leave all rooms
    leave_room(f'user_{current_user_id}')
    leave_room('admin')
    leave_room('general')
    
    emit('disconnected', {
        'message': 'Disconnected successfully',
        'user_id': current_user_id
    })

@socketio.on('join_chat')
@jwt_required()
def handle_join_chat(data):
    current_user_id = get_jwt_identity()
    chat_id = data.get('chat_id')
    
    if chat_id:
        join_room(f'chat_{chat_id}')
        emit('chat_joined', {
            'message': 'Joined chat successfully',
            'chat_id': chat_id
        })

@socketio.on('leave_chat')
@jwt_required()
def handle_leave_chat(data):
    current_user_id = get_jwt_identity()
    chat_id = data.get('chat_id')
    
    if chat_id:
        leave_room(f'chat_{chat_id}')
        emit('chat_left', {
            'message': 'Left chat successfully',
            'chat_id': chat_id
        })

@socketio.on('send_message')
@jwt_required()
def handle_send_message(data):
    current_user_id = get_jwt_identity()
    chat_id = data.get('chat_id')
    message = data.get('message')
    
    if chat_id and message:
        # Create chat message
        chat_message = ChatMessage(
            chat_id=chat_id,
            user_id=current_user_id,
            message=message
        )
        db.session.add(chat_message)
        db.session.commit()
        
        # Emit message to chat room
        emit('new_message', {
            'message': message,
            'user_id': current_user_id,
            'timestamp': chat_message.created_at.isoformat()
        }, room=f'chat_{chat_id}')

@socketio.on('typing')
@jwt_required()
def handle_typing(data):
    current_user_id = get_jwt_identity()
    chat_id = data.get('chat_id')
    
    if chat_id:
        emit('user_typing', {
            'user_id': current_user_id
        }, room=f'chat_{chat_id}')

@socketio.on('stop_typing')
@jwt_required()
def handle_stop_typing(data):
    current_user_id = get_jwt_identity()
    chat_id = data.get('chat_id')
    
    if chat_id:
        emit('user_stop_typing', {
            'user_id': current_user_id
        }, room=f'chat_{chat_id}')

@socketio.on('read_message')
@jwt_required()
def handle_read_message(data):
    current_user_id = get_jwt_identity()
    chat_id = data.get('chat_id')
    message_id = data.get('message_id')
    
    if chat_id and message_id:
        # Mark message as read
        chat_message = ChatMessage.query.get_or_404(message_id)
        if chat_message.chat_id == chat_id:
            chat_message.read = True
            chat_message.read_at = datetime.utcnow()
            db.session.commit()
            
            emit('message_read', {
                'message_id': message_id,
                'user_id': current_user_id
            }, room=f'chat_{chat_id}')

@socketio.on('join_notification_room')
@jwt_required()
def handle_join_notification_room(data):
    current_user_id = get_jwt_identity()
    room_type = data.get('room_type')  # e.g., 'sales', 'inventory', 'system'
    
    if room_type:
        room = f'{room_type}_notifications'
        join_room(room)
        emit('notification_room_joined', {
            'message': f'Joined {room_type} notifications room',
            'room': room
        })

@socketio.on('leave_notification_room')
@jwt_required()
def handle_leave_notification_room(data):
    current_user_id = get_jwt_identity()
    room_type = data.get('room_type')
    
    if room_type:
        room = f'{room_type}_notifications'
        leave_room(room)
        emit('notification_room_left', {
            'message': f'Left {room_type} notifications room',
            'room': room
        })

# Admin-only events
@socketio.on('broadcast_message')
@jwt_required()
@admin_required
def handle_broadcast_message(data):
    message = data.get('message')
    room = data.get('room', 'general')
    
    if message:
        emit('broadcast', {
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }, room=room)

@socketio.on('system_update')
@jwt_required()
@admin_required
def handle_system_update(data):
    update_type = data.get('type')
    update_data = data.get('data')
    
    if update_type and update_data:
        emit('system_update', {
            'type': update_type,
            'data': update_data,
            'timestamp': datetime.utcnow().isoformat()
        }, room='general')

@socketio.on('force_disconnect')
@jwt_required()
@admin_required
def handle_force_disconnect(data):
    user_id = data.get('user_id')
    
    if user_id:
        emit('force_disconnect', {
            'message': 'You have been disconnected by an administrator'
        }, room=f'user_{user_id}') 
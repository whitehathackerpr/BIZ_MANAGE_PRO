from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from ..models import User, Notification
from ..extensions import get_db
from ..utils.decorators import admin_required

router = APIRouter()

# Pydantic models
class ChatMessageBase(BaseModel):
    chat_id: int
    message: str

class BroadcastMessage(BaseModel):
    message: str
    room: Optional[str] = "general"

class SystemUpdate(BaseModel):
    type: str
    data: dict

class ForceDisconnect(BaseModel):
    user_id: int

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.user_rooms: dict[int, set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[str(user_id)] = websocket
        self.user_rooms[user_id] = set()

    async def disconnect(self, user_id: int):
        if str(user_id) in self.active_connections:
            del self.active_connections[str(user_id)]
        if user_id in self.user_rooms:
            del self.user_rooms[user_id]

    async def join_room(self, user_id: int, room: str):
        if user_id in self.user_rooms:
            self.user_rooms[user_id].add(room)

    async def leave_room(self, user_id: int, room: str):
        if user_id in self.user_rooms and room in self.user_rooms[user_id]:
            self.user_rooms[user_id].remove(room)

    async def send_personal_message(self, message: dict, user_id: int):
        if str(user_id) in self.active_connections:
            await self.active_connections[str(user_id)].send_json(message)

    async def broadcast(self, message: dict, room: str):
        for user_id, rooms in self.user_rooms.items():
            if room in rooms and str(user_id) in self.active_connections:
                await self.active_connections[str(user_id)].send_json(message)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await manager.connect(websocket, current_user.id)
    
    # Join user's personal room for notifications
    await manager.join_room(current_user.id, f'user_{current_user.id}')
    
    # Join admin room if user is admin
    if current_user.is_admin:
        await manager.join_room(current_user.id, 'admin')
    
    # Join general room for system updates
    await manager.join_room(current_user.id, 'general')
    
    await websocket.send_json({
        'message': 'Connected successfully',
        'user_id': current_user.id,
        'is_admin': current_user.is_admin
    })
    
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get('type')
            
            if event_type == 'join_chat':
                chat_id = data.get('chat_id')
                if chat_id:
                    await manager.join_room(current_user.id, f'chat_{chat_id}')
                    await websocket.send_json({
                        'type': 'chat_joined',
                        'message': 'Joined chat successfully',
                        'chat_id': chat_id
                    })
            
            elif event_type == 'leave_chat':
                chat_id = data.get('chat_id')
                if chat_id:
                    await manager.leave_room(current_user.id, f'chat_{chat_id}')
                    await websocket.send_json({
                        'type': 'chat_left',
                        'message': 'Left chat successfully',
                        'chat_id': chat_id
                    })
            
            elif event_type == 'send_message':
                chat_id = data.get('chat_id')
                message = data.get('message')
                if chat_id and message:
                    # Create chat message
                    chat_message = ChatMessage(
                        chat_id=chat_id,
                        user_id=current_user.id,
                        message=message
                    )
                    db.add(chat_message)
                    db.commit()
                    
                    # Broadcast message to chat room
                    await manager.broadcast({
                        'type': 'new_message',
                        'message': message,
                        'user_id': current_user.id,
                        'timestamp': chat_message.created_at.isoformat()
                    }, f'chat_{chat_id}')
            
            elif event_type == 'typing':
                chat_id = data.get('chat_id')
                if chat_id:
                    await manager.broadcast({
                        'type': 'user_typing',
                        'user_id': current_user.id
                    }, f'chat_{chat_id}')
            
            elif event_type == 'stop_typing':
                chat_id = data.get('chat_id')
                if chat_id:
                    await manager.broadcast({
                        'type': 'user_stop_typing',
                        'user_id': current_user.id
                    }, f'chat_{chat_id}')
            
            elif event_type == 'read_message':
                chat_id = data.get('chat_id')
                message_id = data.get('message_id')
                if chat_id and message_id:
                    # Mark message as read
                    chat_message = db.query(ChatMessage).get(message_id)
                    if chat_message and chat_message.chat_id == chat_id:
                        chat_message.read = True
                        chat_message.read_at = datetime.utcnow()
                        db.commit()
                        
                        await manager.broadcast({
                            'type': 'message_read',
                            'message_id': message_id,
                            'user_id': current_user.id
                        }, f'chat_{chat_id}')
            
            elif event_type == 'join_notification_room':
                room_type = data.get('room_type')
                if room_type:
                    room = f'{room_type}_notifications'
                    await manager.join_room(current_user.id, room)
                    await websocket.send_json({
                        'type': 'notification_room_joined',
                        'message': f'Joined {room_type} notifications room',
                        'room': room
                    })
            
            elif event_type == 'leave_notification_room':
                room_type = data.get('room_type')
                if room_type:
                    room = f'{room_type}_notifications'
                    await manager.leave_room(current_user.id, room)
                    await websocket.send_json({
                        'type': 'notification_room_left',
                        'message': f'Left {room_type} notifications room',
                        'room': room
                    })
            
            elif event_type == 'broadcast_message' and current_user.is_admin:
                message = data.get('message')
                room = data.get('room', 'general')
                if message:
                    await manager.broadcast({
                        'type': 'broadcast',
                        'message': message,
                        'timestamp': datetime.utcnow().isoformat()
                    }, room)
            
            elif event_type == 'system_update' and current_user.is_admin:
                update_type = data.get('type')
                update_data = data.get('data')
                if update_type and update_data:
                    await manager.broadcast({
                        'type': 'system_update',
                        'update_type': update_type,
                        'data': update_data,
                        'timestamp': datetime.utcnow().isoformat()
                    }, 'general')
            
            elif event_type == 'force_disconnect' and current_user.is_admin:
                user_id = data.get('user_id')
                if user_id:
                    await manager.send_personal_message({
                        'type': 'force_disconnect',
                        'message': 'You have been disconnected by an administrator'
                    }, user_id)
    
    except WebSocketDisconnect:
        await manager.disconnect(current_user.id)
        # Leave all rooms
        await manager.leave_room(current_user.id, f'user_{current_user.id}')
        await manager.leave_room(current_user.id, 'admin')
        await manager.leave_room(current_user.id, 'general') 
from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..models import Chat, ChatMessage, ChatParticipant, User
from ..extensions import get_db
from ..utils.decorators import admin_required
from ..utils.notifications import create_notification

router = APIRouter()

# Pydantic models
class ChatBase(BaseModel):
    name: str
    type: str = "private"
    participants: List[int]

class ChatCreate(ChatBase):
    pass

class ChatResponse(ChatBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessage]
    participants: List[ChatParticipant]

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    content: str
    chat_id: int

class ChatMessageResponse(ChatMessageBase):
    id: int
    sender_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatParticipantBase(BaseModel):
    user_id: int
    role: str = "member"

class ChatParticipantResponse(ChatParticipantBase):
    id: int
    chat_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Routes
@router.get("/chats", response_model=dict)
async def get_chats(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get chats where user is a participant
    chats = db.query(Chat).join(
        ChatParticipant
    ).filter(
        ChatParticipant.user_id == current_user.id
    ).order_by(
        Chat.updated_at.desc()
    ).offset((page - 1) * per_page).limit(per_page).all()
    
    total = db.query(Chat).join(
        ChatParticipant
    ).filter(
        ChatParticipant.user_id == current_user.id
    ).count()
    
    return {
        "chats": chats,
        "total": total,
        "pages": (total + per_page - 1) // per_page,
        "current_page": page
    }

@router.post("/chats", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate required fields
    if not chat.participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one participant is required"
        )
    
    # Create chat
    db_chat = Chat(
        name=chat.name,
        type=chat.type,
        created_by=current_user.id
    )
    db.add(db_chat)
    
    # Add participants
    participants = set(chat.participants + [current_user.id])
    for user_id in participants:
        participant = ChatParticipant(
            chat=db_chat,
            user_id=user_id,
            role="admin" if user_id == current_user.id else "member"
        )
        db.add(participant)
        
        # Create notification for new participants
        if user_id != current_user.id:
            create_notification(
                user_id=user_id,
                title="New Chat",
                message=f"You have been added to a new chat: {chat.name}",
                type="chat"
            )
    
    db.commit()
    db.refresh(db_chat)
    return db_chat

@router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    return chat

@router.put("/chats/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: int,
    chat_update: ChatBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant and has admin role
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id,
        ChatParticipant.role == "admin"
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or insufficient permissions"
        )
    
    # Update chat fields
    chat.name = chat_update.name
    chat.type = chat_update.type
    
    db.commit()
    db.refresh(chat)
    return chat

@router.delete("/chats/{chat_id}")
async def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant and has admin role
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id,
        ChatParticipant.role == "admin"
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or insufficient permissions"
        )
    
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted successfully"}

@router.get("/chats/{chat_id}/messages", response_model=dict)
async def get_chat_messages(
    chat_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    messages = db.query(ChatMessage).filter_by(
        chat_id=chat_id
    ).order_by(
        ChatMessage.created_at.desc()
    ).offset((page - 1) * per_page).limit(per_page).all()
    
    total = db.query(ChatMessage).filter_by(chat_id=chat_id).count()
    
    return {
        "messages": messages,
        "total": total,
        "pages": (total + per_page - 1) // per_page,
        "current_page": page
    }

@router.get("/chats/{chat_id}/participants", response_model=List[ChatParticipantResponse])
async def get_chat_participants(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    participants = db.query(ChatParticipant).filter_by(
        chat_id=chat_id
    ).all()
    
    return participants

@router.post("/chats/{chat_id}/participants")
async def add_chat_participants(
    chat_id: int,
    participants: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant and has admin role
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id,
        ChatParticipant.role == "admin"
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or insufficient permissions"
        )
    
    if not participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No participants provided"
        )
    
    # Add new participants
    for user_id in participants:
        if not db.query(ChatParticipant).filter_by(
            chat_id=chat_id, user_id=user_id
        ).first():
            participant = ChatParticipant(
                chat_id=chat_id,
                user_id=user_id,
                role="member"
            )
            db.add(participant)
            
            # Create notification for new participant
            create_notification(
                user_id=user_id,
                title="Added to Chat",
                message=f"You have been added to chat: {chat.name}",
                type="chat"
            )
    
    db.commit()
    return {"message": "Participants added successfully"}

@router.delete("/chats/{chat_id}/participants/{user_id}")
async def remove_chat_participant(
    chat_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant and has admin role
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id,
        ChatParticipant.role == "admin"
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or insufficient permissions"
        )
    
    participant = db.query(ChatParticipant).filter_by(
        chat_id=chat_id,
        user_id=user_id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    db.delete(participant)
    db.commit()
    return {"message": "Participant removed successfully"}

@router.put("/chats/{chat_id}/participants/{user_id}/role")
async def update_participant_role(
    chat_id: int,
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a participant and has admin role
    chat = db.query(Chat).join(
        ChatParticipant
    ).filter(
        Chat.id == chat_id,
        ChatParticipant.user_id == current_user.id,
        ChatParticipant.role == "admin"
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or insufficient permissions"
        )
    
    participant = db.query(ChatParticipant).filter_by(
        chat_id=chat_id,
        user_id=user_id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    participant.role = role
    db.commit()
    return {"message": "Participant role updated successfully"} 
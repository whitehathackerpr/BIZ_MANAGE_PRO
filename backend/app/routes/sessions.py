from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import redis
import json
import uuid

from ..db.session import get_db
from ..models import User, Session as UserSession
from ..schemas.auth import SessionCreate, SessionResponse, SessionList
from ..auth.dependencies import get_current_user
from ..core.config import settings

# Initialize Redis connection
redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
SESSION_PREFIX = "user_session:"
SESSION_EXPIRY = 60 * 60 * 24  # 24 hours in seconds

router = APIRouter()

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new session for a user"""
    # Check if user exists
    user = db.query(User).filter(User.id == session_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Only allow admins or the user themselves to create sessions
    if current_user.id != session_data.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create session for this user"
        )
    
    # Create a unique session ID
    session_id = str(uuid.uuid4())
    
    # Set session expiry time
    created_at = datetime.utcnow()
    expires_at = created_at + timedelta(days=1)  # Sessions expire after 1 day
    
    # Create session in database
    db_session = UserSession(
        id=session_id,
        user_id=session_data.user_id,
        device_info=session_data.device_info,
        ip_address=session_data.ip_address,
        created_at=created_at,
        expires_at=expires_at,
        is_active=True
    )
    db.add(db_session)
    
    # Store session in Redis for faster access
    session_data_redis = {
        "id": session_id,
        "user_id": session_data.user_id,
        "created_at": created_at.isoformat(),
        "expires_at": expires_at.isoformat(),
        "device_info": session_data.device_info,
        "ip_address": session_data.ip_address,
        "is_active": True
    }
    redis_key = f"{SESSION_PREFIX}{session_id}"
    redis_client.setex(
        redis_key,
        SESSION_EXPIRY,
        json.dumps(session_data_redis)
    )
    
    # Add to user's active sessions
    user_sessions_key = f"user:{session_data.user_id}:sessions"
    redis_client.sadd(user_sessions_key, session_id)
    
    db.commit()
    db.refresh(db_session)
    
    return {
        "id": db_session.id,
        "user_id": db_session.user_id,
        "created_at": db_session.created_at,
        "expires_at": db_session.expires_at,
        "device_info": db_session.device_info,
        "ip_address": db_session.ip_address,
        "is_active": db_session.is_active
    }

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a session by ID"""
    # First try to get from Redis for performance
    redis_key = f"{SESSION_PREFIX}{session_id}"
    session_data = redis_client.get(redis_key)
    
    if session_data:
        # Parse JSON data
        session = json.loads(session_data)
        
        # Check authorization
        if current_user.id != session["user_id"] and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this session"
            )
        
        # Convert ISO format strings back to datetime
        session["created_at"] = datetime.fromisoformat(session["created_at"])
        session["expires_at"] = datetime.fromisoformat(session["expires_at"])
        
        return session
    
    # If not in Redis, try the database
    db_session = db.query(UserSession).filter(UserSession.id == session_id).first()
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Check authorization
    if current_user.id != db_session.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this session"
        )
    
    return {
        "id": db_session.id,
        "user_id": db_session.user_id,
        "created_at": db_session.created_at,
        "expires_at": db_session.expires_at,
        "device_info": db_session.device_info,
        "ip_address": db_session.ip_address,
        "is_active": db_session.is_active
    }

@router.get("/users/{user_id}/sessions", response_model=SessionList)
async def get_user_sessions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sessions for a user"""
    # Check authorization
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view sessions for this user"
        )
    
    # Get session IDs from Redis
    user_sessions_key = f"user:{user_id}:sessions"
    session_ids = redis_client.smembers(user_sessions_key)
    
    sessions = []
    
    if session_ids:
        # Get multiple sessions at once from Redis
        for session_id in session_ids:
            redis_key = f"{SESSION_PREFIX}{session_id}"
            session_data = redis_client.get(redis_key)
            
            if session_data:
                session = json.loads(session_data)
                # Convert ISO format strings back to datetime
                session["created_at"] = datetime.fromisoformat(session["created_at"])
                session["expires_at"] = datetime.fromisoformat(session["expires_at"])
                sessions.append(session)
    
    # If no sessions in Redis or not all were found, query database
    if not sessions:
        db_sessions = db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).all()
        
        sessions = [
            {
                "id": s.id,
                "user_id": s.user_id,
                "created_at": s.created_at,
                "expires_at": s.expires_at,
                "device_info": s.device_info,
                "ip_address": s.ip_address,
                "is_active": s.is_active
            }
            for s in db_sessions
        ]
    
    return {"sessions": sessions}

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate a session (logout)"""
    # Try to get session from Redis first
    redis_key = f"{SESSION_PREFIX}{session_id}"
    session_data = redis_client.get(redis_key)
    
    if session_data:
        session = json.loads(session_data)
        
        # Check authorization
        if current_user.id != session["user_id"] and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this session"
            )
        
        # Delete from Redis
        redis_client.delete(redis_key)
        
        # Remove from user's active sessions
        user_sessions_key = f"user:{session['user_id']}:sessions"
        redis_client.srem(user_sessions_key, session_id)
    
    # Also update in database
    db_session = db.query(UserSession).filter(UserSession.id == session_id).first()
    if db_session:
        # Check authorization
        if current_user.id != db_session.user_id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this session"
            )
        
        # Deactivate session
        db_session.is_active = False
        db.commit()
    
    # If session not found in either storage, still return success
    # This is to avoid leaking information about valid session IDs
    return None

@router.delete("/users/{user_id}/sessions", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_user_sessions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate all sessions for a user (force logout)"""
    # Check authorization
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete sessions for this user"
        )
    
    # Get session IDs from Redis
    user_sessions_key = f"user:{user_id}:sessions"
    session_ids = redis_client.smembers(user_sessions_key)
    
    if session_ids:
        # Delete all sessions from Redis
        for session_id in session_ids:
            redis_key = f"{SESSION_PREFIX}{session_id}"
            redis_client.delete(redis_key)
        
        # Remove all sessions from user's active sessions
        redis_client.delete(user_sessions_key)
    
    # Update sessions in database
    db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.is_active == True
    ).update({"is_active": False})
    
    db.commit()
    
    return None

@router.post("/sessions/validate", response_model=bool)
async def validate_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Validate if a session is active and not expired"""
    # Try to get from Redis first
    redis_key = f"{SESSION_PREFIX}{session_id}"
    session_data = redis_client.get(redis_key)
    
    if session_data:
        session = json.loads(session_data)
        
        # Check if expired
        expires_at = datetime.fromisoformat(session["expires_at"])
        if expires_at < datetime.utcnow():
            # Session expired, clean up
            redis_client.delete(redis_key)
            user_sessions_key = f"user:{session['user_id']}:sessions"
            redis_client.srem(user_sessions_key, session_id)
            return False
        
        # Check if active
        return session["is_active"]
    
    # Try database as fallback
    db_session = db.query(UserSession).filter(UserSession.id == session_id).first()
    if not db_session:
        return False
    
    # Check if expired
    if db_session.expires_at < datetime.utcnow():
        # Session expired, update
        db_session.is_active = False
        db.commit()
        return False
    
    return db_session.is_active 
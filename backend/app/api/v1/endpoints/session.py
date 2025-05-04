from fastapi import APIRouter, Depends, HTTPException
from app.core import session as session_utils
from app.api import deps
from app.models.user import User
from app.extensions import redis_client

router = APIRouter()

@router.post("/create")
def create_session(current_user: User = Depends(deps.get_current_user)):
    session_id = session_utils.create_session(current_user.id)
    return {"session_id": session_id}

@router.get("/validate")
def validate_session(session_id: str):
    valid = session_utils.validate_session(session_id)
    return {"valid": valid}

@router.get("/user")
def get_session_user(session_id: str):
    user_id = session_utils.get_session_user(session_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return {"user_id": user_id}

@router.delete("/destroy")
def destroy_session(session_id: str):
    session_utils.destroy_session(session_id)
    return {"success": True}

@router.get("/list")
def list_sessions(current_user: User = Depends(deps.get_current_user)):
    pattern = "session:*"
    session_keys = redis_client.keys(pattern)
    user_sessions = []
    for key in session_keys:
        session = redis_client.hgetall(key)
        if session.get("user_id") == str(current_user.id):
            user_sessions.append({"session_id": key.split(":", 1)[1], **session})
    return {"sessions": user_sessions}

@router.delete("/force-logout")
def force_logout(current_user: User = Depends(deps.get_current_user)):
    pattern = "session:*"
    session_keys = redis_client.keys(pattern)
    count = 0
    for key in session_keys:
        session = redis_client.hgetall(key)
        if session.get("user_id") == str(current_user.id):
            redis_client.delete(key)
            count += 1
    return {"success": True, "sessions_terminated": count} 
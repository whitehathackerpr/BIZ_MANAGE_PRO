import uuid
import time
from app.extensions import redis_client

SESSION_EXPIRY_SECONDS = 3600  # 1 hour


def create_session(user_id):
    session_id = str(uuid.uuid4())
    session_data = {
        "user_id": str(user_id),
        "created_at": str(int(time.time())),
        "expires_at": str(int(time.time()) + SESSION_EXPIRY_SECONDS)
    }
    redis_client.hmset(f"session:{session_id}", session_data)
    redis_client.expire(f"session:{session_id}", SESSION_EXPIRY_SECONDS)
    return session_id

def validate_session(session_id):
    session = redis_client.hgetall(f"session:{session_id}")
    if not session:
        return False
    if int(session["expires_at"]) < int(time.time()):
        destroy_session(session_id)
        return False
    return True

def get_session_user(session_id):
    session = redis_client.hgetall(f"session:{session_id}")
    if session and int(session["expires_at"]) >= int(time.time()):
        return session["user_id"]
    return None

def destroy_session(session_id):
    redis_client.delete(f"session:{session_id}") 
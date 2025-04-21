from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.config import get_settings
from typing import Optional

# Initialize settings
settings = get_settings()

def generate_reset_token(user_id: int) -> str:
    """Generate a secure token for password reset or email verification.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        A secure token that can be used in URLs
    """
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(str(user_id), salt='reset-token-salt')

def verify_reset_token(token: str, expiration: int = 3600) -> Optional[int]:
    """Verify a reset token and return the user ID if valid.
    
    Args:
        token: The token to verify
        expiration: The expiration time in seconds (default: 1 hour)
        
    Returns:
        The user ID if the token is valid, None otherwise
    """
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        user_id = serializer.loads(
            token, 
            salt='reset-token-salt',
            max_age=expiration
        )
        return int(user_id)
    except (BadSignature, SignatureExpired, ValueError):
        return None 
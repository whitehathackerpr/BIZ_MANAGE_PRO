from functools import wraps
from flask import request, g, current_app
import jwt
from ..models.user import User

def create_token(user):
    """Create JWT token for user"""
    return jwt.encode(
        {
            'user_id': user.id,
            'email': user.email,
            'role': user.role
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return {'message': 'Missing authorization token'}, 401

        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            
            g.user = User.query.get(data['user_id'])
            if not g.user:
                return {'message': 'User not found'}, 401
                
        except jwt.ExpiredSignatureError:
            return {'message': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'message': 'Invalid token'}, 401
            
        return f(*args, **kwargs)
    return decorated 
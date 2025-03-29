from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from ..models import User

def admin_required(f):
    """
    Decorator to ensure only administrators can access a route.
    
    Args:
        f (function): The route function to decorate
        
    Returns:
        function: The decorated route function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({
                'error': 'Admin privileges required'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function 
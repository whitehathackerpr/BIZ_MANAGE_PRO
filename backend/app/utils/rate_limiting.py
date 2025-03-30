from functools import wraps
from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

def rate_limit(limit, period):
    """Decorator for rate limiting endpoints."""
    def decorator(f):
        @wraps(f)
        @limiter.limit(f"{limit}/{period}seconds")
        def wrapped(*args, **kwargs):
            return f(*args, **kwargs)
        return wrapped
    return decorator 
from flask import request
from functools import wraps
from datetime import datetime
import redis
from .errors import APIError

class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self, redis_url):
        self.redis = redis.from_url(redis_url)
        
    def limit(self, key_prefix, limit=100, period=60):
        """
        Rate limiting decorator
        
        Args:
            key_prefix: Prefix for Redis key
            limit: Number of requests allowed
            period: Time period in seconds
        """
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                key = f"{key_prefix}:{request.remote_addr}"
                
                # Get current count
                count = self.redis.get(key)
                
                if count is None:
                    # First request
                    self.redis.setex(key, period, 1)
                elif int(count) >= limit:
                    # Rate limit exceeded
                    raise APIError(
                        'Rate limit exceeded. Please try again later.',
                        status_code=429
                    )
                else:
                    # Increment count
                    self.redis.incr(key)
                
                return f(*args, **kwargs)
            return decorated_function
        return decorator 
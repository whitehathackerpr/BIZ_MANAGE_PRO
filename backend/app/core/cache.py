import json
from typing import Any, Optional, Union
from redis import Redis
from ..core.config import settings
from ..core.logging import logger

class RedisCache:
    def __init__(self):
        self.redis_client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        value = self.redis_client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None

    def set(
        self,
        key: str,
        value: Any,
        expire: Optional[int] = None
    ) -> bool:
        """Set value in cache with optional expiration"""
        try:
            if not isinstance(value, (str, bytes)):
                value = json.dumps(value)
            if expire:
                return bool(self.redis_client.setex(key, expire, value))
            return bool(self.redis_client.set(key, value))
        except Exception:
            return False

    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        return bool(self.redis_client.delete(key))

    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        return bool(self.redis_client.exists(key))

    def clear(self) -> bool:
        """Clear all cache"""
        try:
            self.redis_client.flushdb()
            return True
        except Exception:
            return False

    def increment(self, key: str, amount: int = 1) -> int:
        """Increment value in cache"""
        return self.redis_client.incrby(key, amount)

    def decrement(self, key: str, amount: int = 1) -> int:
        """Decrement value in cache"""
        return self.redis_client.decrby(key, amount)

    def ttl(self, key: str) -> int:
        """Get time to live for key"""
        return self.redis_client.ttl(key)

    def keys(self, pattern: str = "*") -> list[str]:
        """Get all keys matching pattern"""
        return self.redis_client.keys(pattern)

# Create a global cache instance
cache = RedisCache() 
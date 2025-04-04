from fastapi import Request, Response, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from typing import Callable, Dict, Any
import aioredis
from pydantic import ValidationError
from functools import wraps
import json

# Initialize middleware
async def setup_middleware(app):
    """Initialize all middleware"""
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],  # Frontend origin
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Trusted hosts
    app.add_middleware(
        TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"]
    )
    
    # Rate limiting
    redis = await aioredis.from_url("redis://localhost", encoding="utf8")
    await FastAPILimiter.init(redis)
    
    # Caching
    redis_cache = await aioredis.from_url("redis://localhost", encoding="utf8")
    FastAPICache.init(RedisBackend(redis_cache), prefix="fastapi-cache")

# Error handling middleware
async def error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except ValidationError as e:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": json.loads(e.json())},
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail},
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": str(e)},
        )

# Request validation decorator
def validate_request(schema):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, request: Request, **kwargs):
            try:
                body = await request.json()
                validated_data = schema.parse_obj(body)
                kwargs["validated_data"] = validated_data
                return await func(*args, **kwargs)
            except ValidationError as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=json.loads(e.json()),
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e),
                )
        return wrapper
    return decorator 
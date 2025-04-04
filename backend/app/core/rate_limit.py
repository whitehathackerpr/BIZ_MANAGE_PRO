from fastapi import HTTPException, Request, status
from fastapi.middleware.base import BaseHTTPMiddleware
import time
from typing import Dict, Tuple
from ..core.logging import logger

class RateLimiter:
    def __init__(self, max_requests: int, time_window: int):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests: Dict[str, list[float]] = {}

    def is_allowed(self, key: str) -> Tuple[bool, int]:
        """
        Check if a request is allowed based on rate limits.
        Returns (is_allowed, remaining_requests)
        """
        current_time = time.time()
        if key not in self.requests:
            self.requests[key] = []

        # Remove old requests
        self.requests[key] = [
            t for t in self.requests[key]
            if current_time - t < self.time_window
        ]

        if len(self.requests[key]) >= self.max_requests:
            return False, 0

        self.requests[key].append(current_time)
        return True, self.max_requests - len(self.requests[key])

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 5, time_window: int = 60):
        super().__init__(app)
        self.rate_limiter = RateLimiter(max_requests, time_window)

    async def dispatch(self, request: Request, call_next):
        # Only apply rate limiting to auth endpoints
        if request.url.path.startswith("/api/v1/auth"):
            client_ip = request.client.host
            is_allowed, remaining = self.rate_limiter.is_allowed(client_ip)

            if not is_allowed:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests",
                    headers={"X-RateLimit-Remaining": str(remaining)},
                )

            response = await call_next(request)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response

        return await call_next(request) 
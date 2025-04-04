from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from ..core.logging import logger

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Log security-related events
        if request.headers.get("X-Forwarded-For"):
            logger.warning(f"Request from proxy: {request.headers['X-Forwarded-For']}")
        
        if request.headers.get("User-Agent") == "curl/7.68.0":
            logger.warning("Potential automated request detected")
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = int(request.scope.get("time", 0))
        
        # Clean up old requests
        self.requests = {
            ip: times
            for ip, times in self.requests.items()
            if current_time - min(times) < self.window
        }
        
        # Check rate limit
        if client_ip in self.requests:
            request_times = self.requests[client_ip]
            if len(request_times) >= self.limit:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return Response(
                    content="Rate limit exceeded",
                    status_code=429
                )
            request_times.append(current_time)
        else:
            self.requests[client_ip] = [current_time]
        
        return await call_next(request) 
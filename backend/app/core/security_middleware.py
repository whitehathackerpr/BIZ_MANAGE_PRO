from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import time
from typing import Dict, List, Optional
from ..core.logging import logger

class ContentSecurityPolicyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.csp_directives = {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            "img-src": ["'self'", "data:", "https://fastapi.tiangolo.com"],
            "connect-src": ["'self'"],
            "font-src": ["'self'", "https://cdn.jsdelivr.net"],
            "object-src": ["'none'"],
            "media-src": ["'self'"],
            "frame-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"]
        }

    def _build_csp_header(self) -> str:
        """Build the Content-Security-Policy header string."""
        return "; ".join(
            f"{directive} {' '.join(sources)}"
            for directive, sources in self.csp_directives.items()
        )

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = self._build_csp_header()
        return response

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        for header, value in self.security_headers.items():
            response.headers[header] = value
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
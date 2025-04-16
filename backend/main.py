import uvicorn
import os
import sys
import logging
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
from datetime import datetime, timedelta, UTC
from pydantic import BaseModel, EmailStr
from typing import Optional
from dotenv import load_dotenv
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import time
import redis
from prometheus_client import Counter, Histogram
import prometheus_client
from prometheus_fastapi_instrumentator import Instrumentator
from app.core.logging import logger
from app.core.security_middleware import SecurityMiddleware, RateLimitMiddleware
from app.core.exceptions import (
    BusinessException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    ValidationException,
    ConflictException
)
from app.config import settings
from app.extensions import engine, Base

# Import the Flask app factory to integrate with FastAPI
from app import create_app as create_flask_app

# Import JWT handling
from jose import JWTError
from app.auth.jwt import create_access_token, decode_token, get_current_user

# Load environment variables
load_dotenv()

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# NOTE: This FastAPI application is in a transitional state while migrating from Flask
# See MIGRATION_TODO.md for details on the remaining tasks needed to complete the migration

# Setup primary FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Create the secondary FastAPI application (previously Flask)
flask_api = create_flask_app()

# Redis configuration
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET_KEY)

# Prometheus instrumentation
Instrumentator().instrument(app).expose(app)

# Custom middleware for request timing and metrics
class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(process_time)
        
        return response

app.add_middleware(MetricsMiddleware)

# Add security middleware
app.add_middleware(SecurityMiddleware)

# Add rate limit middleware
app.add_middleware(RateLimitMiddleware, limit=100, window=60)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

# Add JWT exception handler
@app.exception_handler(JWTError)
async def jwt_exception_handler(request: Request, exc: JWTError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Invalid authentication credentials"}
    )

# Root endpoints
@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "BIZ_MANAGE_PRO API is running"}

# Health check router
health_router = APIRouter(
    prefix="/health",
    tags=["health"],
)

@health_router.get("/")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(UTC).isoformat(),
        "redis": "connected" if redis_client.ping() else "disconnected"
    }

# Include health router
app.include_router(health_router)

# Create required directories
def init_directories():
    """Ensure required directories exist"""
    directories = [
        "logs",
        "uploads",
        "uploads/profile_pics",
        "uploads/product_images",
        "uploads/branch_images"
    ]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")

# Initialize directories
init_directories()

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Create database tables
Base.metadata.create_all(bind=engine)

# Merge FastAPI apps
# This allows us to combine both FastAPI applications by including all routes
# from the flask_api (secondary app) into our main app
for route in flask_api.routes:
    app.routes.append(route)

# Exception handlers
@app.exception_handler(BusinessException)
async def business_exception_handler(request, exc):
    logger.error(f"Business error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request, exc):
    logger.warning(f"Resource not found: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(UnauthorizedException)
async def unauthorized_exception_handler(request, exc):
    logger.warning(f"Unauthorized access: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(ForbiddenException)
async def forbidden_exception_handler(request, exc):
    logger.warning(f"Forbidden access: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(ValidationException)
async def validation_exception_handler(request, exc):
    logger.warning(f"Validation error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(ConflictException)
async def conflict_exception_handler(request, exc):
    logger.warning(f"Conflict error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up BIZ_MANAGE_PRO API")
    # Any additional startup tasks go here

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down BIZ_MANAGE_PRO API")
    # Any cleanup tasks go here

if __name__ == "__main__":
    # Run the integrated FastAPI application
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
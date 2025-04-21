from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
from logging.handlers import RotatingFileHandler
import os
from typing import List
from datetime import timedelta

from app.config import get_settings, Settings
from app.utils.cors import setup_cors

def create_app() -> FastAPI:
    settings = get_settings()

    # Configure logging
    log_level = getattr(logging, settings.LOG_LEVEL.upper())
    logging.basicConfig(level=log_level)
    if settings.LOG_FILE:
        os.makedirs(os.path.dirname(settings.LOG_FILE), exist_ok=True)
        file_handler = RotatingFileHandler(
            settings.LOG_FILE, maxBytes=10485760, backupCount=5
        )
        file_handler.setLevel(log_level)
        formatter = logging.Formatter(settings.LOG_FORMAT)
        file_handler.setFormatter(formatter)
        logging.getLogger().addHandler(file_handler)

    # Initialize FastAPI
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # Setup CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.UPLOAD_DIR)
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # Setup logging
    logging.info('Business Management System startup')

    # Create upload folder if it doesn't exist
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR)

    # Include routers dynamically
    try:
        from app.routes import auth
        app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
        logging.info("Loaded auth routes")
    except ImportError as e:
        logging.warning(f"Could not load auth routes: {str(e)}")

    try:
        from app.routes import health
        app.include_router(health.router, prefix="/health", tags=["Health"])
        logging.info("Loaded health routes")
    except ImportError as e:
        logging.warning(f"Could not load health routes: {str(e)}")

    @app.get("/")
    async def root():
        return {"message": "Welcome to BIZ_MANAGE_PRO API"}

    return app 
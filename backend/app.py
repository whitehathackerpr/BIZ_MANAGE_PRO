from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_jwt_auth import AuthJWT
from fastapi_limiter import FastAPILimiter
import aioredis
import logging
from logging.handlers import RotatingFileHandler
import os
from config import Config

# Import routes only once
from app.routes import (
    auth, users, products, sales, inventory, analytics,
    notifications, settings, websocket, branch, roles
)

def create_app(config_class=Config):
    """
    Create a FastAPI application with all necessary routes and middleware.
    This function is called from main.py to create a secondary FastAPI app
    that will be merged with the primary app.
    """
    app = FastAPI(
        title="Business Management API (Legacy)",
        version="1.0",
        description="A comprehensive API for managing business operations",
        docs_url="/api/legacy/docs"
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Set up logging
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    file_handler = RotatingFileHandler(
        'logs/app.log', maxBytes=10240, backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    logging.getLogger().addHandler(file_handler)
    logging.getLogger().setLevel(logging.INFO)
    logging.info('Business Management API startup')

    # Ensure upload folder exists
    if not os.path.exists(config_class.UPLOAD_FOLDER):
        os.makedirs(config_class.UPLOAD_FOLDER)

    # Register routers
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
    app.include_router(branch.router, prefix="/api/v1/branches", tags=["Branches"])
    app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
    app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales"])
    app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
    app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
    app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
    app.include_router(settings.router, prefix="/api/v1/settings", tags=["Settings"])
    app.include_router(roles.router, prefix="/api/v1/roles", tags=["Roles"])
    app.include_router(websocket.router, prefix="/api/v1", tags=["WebSockets"])

    @app.on_event("startup")
    async def startup():
        # Initialize rate limiter
        redis = await aioredis.from_url(config_class.REDIS_URL, encoding="utf8")
        await FastAPILimiter.init(redis)
        logging.info("Rate limiter initialized")

    @app.get("/api/health")
    async def health_check():
        """Health check endpoint for legacy API"""
        return {"status": "ok", "legacy_api": True}

    return app 

# Use the FastAPI app created in the app module
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True) 
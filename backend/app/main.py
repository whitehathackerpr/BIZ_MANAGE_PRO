from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.security import OAuth2PasswordBearer
from prometheus_client import make_asgi_app
from sqlalchemy.orm import Session
from .api.v1.api import router as api_v1_router
from .core.config import settings
from .core.logging import logger
from .db.session import SessionLocal, engine
from .db.init_db import init_db
from .core.rate_limit import RateLimitMiddleware
from .db.base import Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Add Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include API router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("Starting up FastAPI application")
    
    # Initialize database
    db = SessionLocal()
    try:
        init_db(db)
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
    finally:
        db.close()

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("Shutting down FastAPI application")

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="API documentation with security schemes",
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "flows": {
                "password": {
                    "tokenUrl": f"{settings.API_V1_STR}/auth/login",
                    "scopes": {
                        "read": "Read access",
                        "write": "Write access",
                    }
                }
            }
        },
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    
    # Add security requirements
    openapi_schema["security"] = [{"OAuth2PasswordBearer": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Custom Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        title=f"{settings.PROJECT_NAME} - Swagger UI",
        oauth2_redirect_url="/docs/oauth2-redirect",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
    ) 
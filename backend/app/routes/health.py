from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import psutil
import os
from datetime import datetime

from app.extensions import get_db, redis_client
from app.config import get_settings, Settings

router = APIRouter(
    prefix="/health",
    tags=["health"],
)

@router.get("/", summary="Health check endpoint")
async def health_check(
    settings: Settings = Depends(get_settings)
):
    """
    Health check endpoint for monitoring the application.
    Returns overall health status and metadata about the application.
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENV", "development"),
    }

@router.get("/detail", summary="Detailed health check")
async def detailed_health(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings)
):
    """
    Detailed health check that verifies database and Redis connections,
    as well as system resources.
    """
    health_info = {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": {"status": "unknown"},
            "redis": {"status": "unknown"},
            "system": {
                "cpu_usage": psutil.cpu_percent(),
                "memory_usage": psutil.virtual_memory().percent,
                "disk_usage": psutil.disk_usage('/').percent,
            }
        }
    }
    
    # Check database connection
    try:
        # Simple query to verify the database connection
        db.execute("SELECT 1")
        health_info["checks"]["database"] = {
            "status": "ok"
        }
    except Exception as e:
        health_info["checks"]["database"] = {
            "status": "error",
            "message": str(e)
        }
        health_info["status"] = "degraded"
    
    # Check Redis connection
    try:
        if redis_client:
            redis_info = redis_client.info()
            health_info["checks"]["redis"] = {
                "status": "ok",
                "version": redis_info.get("redis_version", "unknown")
            }
        else:
            health_info["checks"]["redis"] = {
                "status": "not_configured"
            }
    except Exception as e:
        health_info["checks"]["redis"] = {
            "status": "error",
            "message": str(e)
        }
        health_info["status"] = "degraded"
    
    # Check overall system health
    if health_info["checks"]["system"]["memory_usage"] > 90 or \
       health_info["checks"]["system"]["cpu_usage"] > 90 or \
       health_info["checks"]["system"]["disk_usage"] > 90:
        health_info["status"] = "warning"
    
    return health_info 
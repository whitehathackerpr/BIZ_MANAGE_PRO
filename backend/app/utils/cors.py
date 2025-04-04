from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

def setup_cors(app: FastAPI) -> None:
    """
    Configure CORS settings for the FastAPI application.
    
    Args:
        app: The FastAPI application instance
    """
    settings = get_settings()
    
    # Split the comma-separated CORS origins string into a list
    origins = settings.cors_origins.split(",") if settings.cors_origins else ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
        max_age=600,  # Cache preflight requests for 10 minutes
    )
    
    return None 
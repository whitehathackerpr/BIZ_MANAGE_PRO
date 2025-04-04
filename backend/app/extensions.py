from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from app.config import get_settings

# Database
settings = get_settings()
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create a reference to db for backward compatibility
db = SessionLocal()

# Redis client - initialized later
redis_client = None

# Limiter object - placeholder for FastAPI limiter
limiter = None

# Initialize directories
def init_directories():
    """Ensure required directories exist"""
    directories = [
        "logs",
        "uploads",
        "uploads/profile_pics",
        "uploads/product_images"
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
    
    return True
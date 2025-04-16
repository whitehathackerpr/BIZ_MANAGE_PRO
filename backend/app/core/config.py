from typing import List, Optional, Union, Any
from pydantic import PostgresDsn, field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os
import json

class Settings(BaseSettings):
    # Application Settings
    PROJECT_NAME: str = "BIZ_MANAGE_PRO"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "FastAPI backend for BIZ_MANAGE_PRO"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = Field(default="dev_secret_key_change_in_production")
    API_V1_STR: str = "/api/v1"

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:5174"],
        description="JSON list of allowed origins"
    )
    SSL_KEYFILE: Optional[str] = None
    SSL_CERTFILE: Optional[str] = None

    # Database Settings
    DATABASE_URL: Union[PostgresDsn, str] = Field(default="sqlite:///./test.db")
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # JWT Settings
    JWT_SECRET_KEY: str = Field(default="jwt_dev_secret_key_change_in_production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Email Settings
    SMTP_HOST: str = Field(default="localhost")
    SMTP_PORT: int = Field(default=1025)
    SMTP_USER: str = Field(default="test")
    SMTP_PASSWORD: str = Field(default="test")
    EMAIL_FROM: str = Field(default="test@example.com")
    EMAIL_TEMPLATES_DIR: str = "app/email-templates"

    # File Upload Settings
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = Field(
        default=["jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx"],
        description="JSON list of allowed file extensions"
    )

    # Logging Settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = "logs/app.log"

    # Monitoring Settings
    PROMETHEUS_METRICS_PORT: int = 9090
    ENABLE_METRICS: bool = True

    # Security Settings
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:5174"],
        description="JSON list of allowed CORS origins"
    )
    RATE_LIMIT_PER_MINUTE: int = 60
    SESSION_SECRET_KEY: str = Field(default="session_dev_secret_key_change_in_production")
    ENABLE_HTTPS: bool = False

    # Feature Flags
    ENABLE_WEBSOCKET: bool = True
    ENABLE_CACHING: bool = True
    ENABLE_ANALYTICS: bool = True
    ENABLE_NOTIFICATIONS: bool = True

    # External Services
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    FACEBOOK_CLIENT_ID: Optional[str] = None
    FACEBOOK_CLIENT_SECRET: Optional[str] = None

    # Backup Settings
    BACKUP_DIR: str = "backups"
    BACKUP_SCHEDULE: str = "0 0 * * *"  # Daily at midnight
    BACKUP_RETENTION_DAYS: int = 7

    # Cache Settings
    CACHE_TTL: int = 3600  # 1 hour
    CACHE_MAX_SIZE: int = 1000
    CACHE_STRATEGY: str = "LRU"

    # Analytics Settings
    ANALYTICS_ENABLED: bool = True
    ANALYTICS_SAMPLE_RATE: float = 1.0
    ANALYTICS_BATCH_SIZE: int = 100

    # Notification Settings
    NOTIFICATION_QUEUE_SIZE: int = 1000
    NOTIFICATION_BATCH_SIZE: int = 100
    NOTIFICATION_RETRY_ATTEMPTS: int = 3
    NOTIFICATION_RETRY_DELAY: int = 5

    # WebSocket Settings
    WEBSOCKET_PING_INTERVAL: int = 20
    WEBSOCKET_PING_TIMEOUT: int = 20
    WEBSOCKET_MAX_SIZE: int = 1048576  # 1MB

    # Initial User Settings
    FIRST_SUPERUSER: str = "superuser@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "changeme"
    FIRST_ADMIN: str = "admin@example.com"
    FIRST_ADMIN_PASSWORD: str = "changeme"

    @field_validator("ALLOWED_ORIGINS", "CORS_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    @field_validator("ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_allowed_extensions(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    try:
        return Settings()
    except Exception as e:
        print(f"Error loading settings: {e}")
        # Fallback to defaults if environment variables are not correctly formatted
        return Settings.model_construct()

settings = get_settings() 
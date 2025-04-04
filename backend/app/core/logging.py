import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from ..core.config import settings

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging
logger = logging.getLogger("biz_manage_pro")
logger.setLevel(settings.LOG_LEVEL)

# Create formatters
file_formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
console_formatter = logging.Formatter(
    "%(levelname)s - %(message)s"
)

# Create file handler
file_handler = RotatingFileHandler(
    log_dir / "app.log",
    maxBytes=10485760,  # 10MB
    backupCount=5,
    encoding="utf-8"
)
file_handler.setLevel(settings.LOG_LEVEL)
file_handler.setFormatter(file_formatter)

# Create console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(settings.LOG_LEVEL)
console_handler.setFormatter(console_formatter)

# Add handlers to logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Prevent propagation to root logger
logger.propagate = False

def setup_logger(name: str) -> logging.Logger:
    """Create a logger instance for a module"""
    module_logger = logging.getLogger(f"biz_manage_pro.{name}")
    module_logger.setLevel(settings.LOG_LEVEL)
    module_logger.addHandler(file_handler)
    module_logger.addHandler(console_handler)
    module_logger.propagate = False
    return module_logger 
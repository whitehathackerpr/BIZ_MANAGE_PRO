import os
import sys
import logging
import uvicorn
from dotenv import load_dotenv
from app import create_app
from alembic.config import Config as AlembicConfig
from alembic import command

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/run.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_migrations(downgrade=False):
    """Run database migrations"""
    try:
        # Setup Alembic configuration
        alembic_cfg = AlembicConfig("alembic.ini")
        
        if downgrade:
            # Downgrade to previous revision
            command.downgrade(alembic_cfg, "-1")
            print("Database downgraded successfully!")
        else:
            # Run migrations
            command.upgrade(alembic_cfg, "head")
            print("Database migrations completed successfully!")
    except Exception as e:
        print(f"Error during migrations: {str(e)}")
        sys.exit(1)

def ensure_directories():
    """Ensure required directories exist"""
    directories = [
        "logs",
        "uploads",
        "uploads/profile_pics",
        "uploads/product_images",
        "uploads/branch_images"
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
    
    print("Directory structure verified!")

def main():
    """Main function to run the FastAPI application"""
    try:
        # Get configuration from environment
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", 8000))
        reload = os.getenv("DEBUG", "False").lower() == "true"
        ssl_keyfile = os.getenv("SSL_KEYFILE")
        ssl_certfile = os.getenv("SSL_CERTFILE")

        # Log startup information
        logger.info(f"Starting BIZ_MANAGE_PRO API server...")
        logger.info(f"Host: {host}")
        logger.info(f"Port: {port}")
        logger.info(f"Debug mode: {reload}")
        logger.info(f"SSL enabled: {bool(ssl_keyfile and ssl_certfile)}")

        # Run the application
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            ssl_keyfile=ssl_keyfile,
            ssl_certfile=ssl_certfile,
            log_level="info"
        )

    except Exception as e:
        logger.error(f"Error starting server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Handle command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "migrate":
            run_migrations()
            sys.exit(0)
        elif sys.argv[1] == "downgrade":
            run_migrations(downgrade=True)
            sys.exit(0)
    
    # Ensure required directories exist
    ensure_directories()
    
    main() 
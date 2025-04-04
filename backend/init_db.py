import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command
from dotenv import load_dotenv

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/init_db.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize the database with required tables and initial data"""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")

        # Create database engine
        engine = create_engine(database_url)
        
        # Create session
        Session = sessionmaker(bind=engine)
        session = Session()

        # Run Alembic migrations
        logger.info("Running database migrations...")
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")

        # Import models after migrations
        from app.models import (
            User, Role, Branch, Product, Sale,
            Customer, Employee, Inventory, Notification
        )

        # Create initial roles if they don't exist
        logger.info("Creating initial roles...")
        roles = [
            {"name": "admin", "description": "Administrator with full access"},
            {"name": "manager", "description": "Branch manager with limited access"},
            {"name": "employee", "description": "Regular employee with basic access"},
            {"name": "customer", "description": "Customer with limited access"}
        ]

        for role_data in roles:
            role = session.query(Role).filter_by(name=role_data["name"]).first()
            if not role:
                role = Role(**role_data)
                session.add(role)

        # Create admin user if it doesn't exist
        logger.info("Creating admin user...")
        admin_role = session.query(Role).filter_by(name="admin").first()
        if admin_role:
            admin = session.query(User).filter_by(email="admin@example.com").first()
            if not admin:
                admin = User(
                    email="admin@example.com",
                    full_name="Admin User",
                    password="admin123",  # This should be hashed in production
                    role_id=admin_role.id,
                    is_active=True,
                    is_superuser=True
                )
                session.add(admin)

        # Create initial branch if it doesn't exist
        logger.info("Creating initial branch...")
        branch = session.query(Branch).first()
        if not branch:
            branch = Branch(
                name="Main Branch",
                address="123 Main Street",
                city="New York",
                state="NY",
                zip_code="10001",
                phone="123-456-7890",
                email="main@example.com",
                is_active=True
            )
            session.add(branch)

        # Commit changes
        session.commit()
        logger.info("Database initialization completed successfully")

    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        session.rollback()
        raise

    finally:
        session.close()

if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        sys.exit(1) 
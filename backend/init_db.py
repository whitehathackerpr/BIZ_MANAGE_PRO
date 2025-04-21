import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
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
        
        # Import models
        from app.db import Base
        from app.models import User, Role, user_role, user_permission
        
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Create session
        Session = sessionmaker(bind=engine)
        session = Session()

        try:
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
                        is_active=True,
                        is_superuser=True
                    )
                    session.add(admin)
                    admin.roles.append(admin_role)

            # Commit changes
            session.commit()
            logger.info("Database initialization completed successfully")

        except Exception as e:
            logger.error(f"Error during database operations: {str(e)}")
            session.rollback()
            raise
        finally:
            session.close()

    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        sys.exit(1) 
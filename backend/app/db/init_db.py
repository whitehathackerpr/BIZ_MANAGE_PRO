import logging
from sqlalchemy.orm import Session
from ..core.config import settings
from ..models.user import User
from ..models.role import Role
from ..models.permission import Permission
from ..core.security import get_password_hash

logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    """
    Initialize the database with initial data.
    """
    # Create roles
    roles = [
        {
            "name": "superuser",
            "description": "Superuser with all permissions"
        },
        {
            "name": "admin",
            "description": "Administrator with most permissions"
        },
        {
            "name": "user",
            "description": "Regular user with basic permissions"
        }
    ]

    for role_data in roles:
        role = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not role:
            role = Role(**role_data)
            db.add(role)
            logger.info(f"Created role: {role_data['name']}")

    db.commit()

    # Create permissions
    permissions = [
        # User Management
        {"name": "user:read", "description": "Read user information"},
        {"name": "user:create", "description": "Create new users"},
        {"name": "user:update", "description": "Update user information"},
        {"name": "user:delete", "description": "Delete users"},
        
        # Role Management
        {"name": "role:read", "description": "Read role information"},
        {"name": "role:create", "description": "Create new roles"},
        {"name": "role:update", "description": "Update role information"},
        {"name": "role:delete", "description": "Delete roles"},
        
        # Permission Management
        {"name": "permission:read", "description": "Read permission information"},
        {"name": "permission:create", "description": "Create new permissions"},
        {"name": "permission:update", "description": "Update permission information"},
        {"name": "permission:delete", "description": "Delete permissions"},
        
        # Product Management
        {"name": "product:read", "description": "Read product information"},
        {"name": "product:create", "description": "Create new products"},
        {"name": "product:update", "description": "Update product information"},
        {"name": "product:delete", "description": "Delete products"},
        
        # Sales Management
        {"name": "sale:read", "description": "Read sale information"},
        {"name": "sale:create", "description": "Create new sales"},
        {"name": "sale:update", "description": "Update sale information"},
        {"name": "sale:delete", "description": "Delete sales"},
        
        # Inventory Management
        {"name": "inventory:read", "description": "Read inventory information"},
        {"name": "inventory:create", "description": "Create inventory records"},
        {"name": "inventory:update", "description": "Update inventory information"},
        {"name": "inventory:delete", "description": "Delete inventory records"},
        
        # Analytics
        {"name": "analytics:read", "description": "Read analytics data"},
        {"name": "analytics:export", "description": "Export analytics data"},
        
        # Settings
        {"name": "settings:read", "description": "Read settings"},
        {"name": "settings:update", "description": "Update settings"},
        
        # Branch Management
        {"name": "branch:read", "description": "Read branch information"},
        {"name": "branch:create", "description": "Create new branches"},
        {"name": "branch:update", "description": "Update branch information"},
        {"name": "branch:delete", "description": "Delete branches"},
        
        # Customer Management
        {"name": "customer:read", "description": "Read customer information"},
        {"name": "customer:create", "description": "Create new customers"},
        {"name": "customer:update", "description": "Update customer information"},
        {"name": "customer:delete", "description": "Delete customers"}
    ]

    for permission_data in permissions:
        permission = db.query(Permission).filter(Permission.name == permission_data["name"]).first()
        if not permission:
            permission = Permission(**permission_data)
            db.add(permission)
            logger.info(f"Created permission: {permission_data['name']}")

    db.commit()

    # Assign all permissions to superuser role
    superuser_role = db.query(Role).filter(Role.name == "superuser").first()
    if superuser_role:
        all_permissions = db.query(Permission).all()
        superuser_role.permissions = all_permissions
        db.commit()
        logger.info("Assigned all permissions to superuser role")

    # Create initial superuser
    superuser = db.query(User).filter(User.email == settings.FIRST_SUPERUSER).first()
    if not superuser:
        superuser = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            is_active=True,
            is_superuser=True
        )
        superuser.roles = [superuser_role]
        db.add(superuser)
        logger.info("Created initial superuser")

    # Create initial admin
    admin = db.query(User).filter(User.email == settings.FIRST_ADMIN).first()
    if not admin:
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        admin = User(
            email=settings.FIRST_ADMIN,
            hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            is_active=True,
            is_superuser=False
        )
        admin.roles = [admin_role]
        db.add(admin)
        logger.info("Created initial admin")

    db.commit() 
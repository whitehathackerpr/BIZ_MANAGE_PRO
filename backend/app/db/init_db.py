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
            "name": "branch_manager",
            "description": "Branch manager with branch-specific permissions"
        },
        {
            "name": "employee",
            "description": "Employee with limited access"
        },
        {
            "name": "cashier",
            "description": "Cashier with sales and inventory access"
        },
        {
            "name": "supplier",
            "description": "Supplier with inventory and delivery access"
        },
        {
            "name": "customer",
            "description": "Customer with product and order access"
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
        {"name": "customer:delete", "description": "Delete customers"},

        # New Permissions for Enhanced Features
        {"name": "delivery:read", "description": "Read delivery information"},
        {"name": "delivery:create", "description": "Create new deliveries"},
        {"name": "delivery:update", "description": "Update delivery information"},
        {"name": "delivery:delete", "description": "Delete deliveries"},
        
        {"name": "order:read", "description": "Read order information"},
        {"name": "order:create", "description": "Create new orders"},
        {"name": "order:update", "description": "Update order information"},
        {"name": "order:delete", "description": "Delete orders"},
        
        {"name": "supplier:read", "description": "Read supplier information"},
        {"name": "supplier:create", "description": "Create new suppliers"},
        {"name": "supplier:update", "description": "Update supplier information"},
        {"name": "supplier:delete", "description": "Delete suppliers"},
        
        {"name": "expired:read", "description": "Read expired products information"},
        {"name": "expired:update", "description": "Update expired products information"},
        
        {"name": "location:read", "description": "Read location information"},
        {"name": "location:update", "description": "Update location information"}
    ]

    for permission_data in permissions:
        permission = db.query(Permission).filter(Permission.name == permission_data["name"]).first()
        if not permission:
            permission = Permission(**permission_data)
            db.add(permission)
            logger.info(f"Created permission: {permission_data['name']}")

    db.commit()

    # Assign permissions to roles
    superuser_role = db.query(Role).filter(Role.name == "superuser").first()
    branch_manager_role = db.query(Role).filter(Role.name == "branch_manager").first()
    employee_role = db.query(Role).filter(Role.name == "employee").first()
    cashier_role = db.query(Role).filter(Role.name == "cashier").first()
    supplier_role = db.query(Role).filter(Role.name == "supplier").first()
    customer_role = db.query(Role).filter(Role.name == "customer").first()

    if superuser_role:
        all_permissions = db.query(Permission).all()
        superuser_role.permissions = all_permissions

    if branch_manager_role:
        branch_manager_permissions = [
            "user:read", "user:create", "user:update",
            "product:read", "product:create", "product:update",
            "sale:read", "sale:create", "sale:update",
            "inventory:read", "inventory:create", "inventory:update",
            "analytics:read",
            "branch:read", "branch:update",
            "customer:read", "customer:create", "customer:update",
            "delivery:read", "delivery:create", "delivery:update",
            "order:read", "order:create", "order:update",
            "location:read", "location:update"
        ]
        branch_manager_role.permissions = db.query(Permission).filter(
            Permission.name.in_(branch_manager_permissions)
        ).all()

    if employee_role:
        employee_permissions = [
            "product:read",
            "sale:read", "sale:create",
            "inventory:read",
            "customer:read", "customer:create",
            "delivery:read",
            "order:read", "order:create",
            "location:read"
        ]
        employee_role.permissions = db.query(Permission).filter(
            Permission.name.in_(employee_permissions)
        ).all()

    if cashier_role:
        cashier_permissions = [
            "product:read",
            "sale:read", "sale:create",
            "inventory:read",
            "customer:read",
            "order:read", "order:create"
        ]
        cashier_role.permissions = db.query(Permission).filter(
            Permission.name.in_(cashier_permissions)
        ).all()

    if supplier_role:
        supplier_permissions = [
            "product:read",
            "inventory:read",
            "delivery:read", "delivery:create", "delivery:update",
            "expired:read", "expired:update",
            "location:read"
        ]
        supplier_role.permissions = db.query(Permission).filter(
            Permission.name.in_(supplier_permissions)
        ).all()

    if customer_role:
        customer_permissions = [
            "product:read",
            "order:read", "order:create",
            "location:read"
        ]
        customer_role.permissions = db.query(Permission).filter(
            Permission.name.in_(customer_permissions)
        ).all()

    db.commit()

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
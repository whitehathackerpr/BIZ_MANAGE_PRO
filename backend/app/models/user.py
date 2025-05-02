from datetime import datetime, UTC
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
import enum
from ..extensions import Base
from typing import List
from app.models.business import Business
from app.models.branch import Branch
from app.models.product import Product
from app.models.order import Order
from app.models.transaction import Transaction

class UserRole(str, enum.Enum):
    OWNER = "owner"
    BRANCH_MANAGER = "branch_manager"
    STAFF = "staff"
    CASHIER = "cashier"
    SUPPLIER = "supplier"
    CUSTOMER = "customer"

class Permission(str, enum.Enum):
    CREATE_BUSINESS = "create_business"
    MANAGE_BRANCHES = "manage_branches"
    ASSIGN_MANAGERS = "assign_managers"
    VIEW_ALL_REPORTS = "view_all_reports"
    MANAGE_PRICING = "manage_pricing"
    MANAGE_EMPLOYEES = "manage_employees"
    VIEW_BRANCH_REPORTS = "view_branch_reports"
    MANAGE_STOCK = "manage_stock"
    PROCESS_SALES = "process_sales"
    VIEW_PRODUCTS = "view_products"
    MANAGE_ORDERS = "manage_orders"

# Association table for user-role many-to-many relationship
user_role = Table(
    'user_role',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)

# Association table for user-permission many-to-many relationship
user_permission = Table(
    'user_permission',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

# Association tables for many-to-many relationships
user_branches = Table(
    'user_branches',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('branch_id', Integer, ForeignKey('branches.id'))
)

user_permissions = Table(
    'user_permissions',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('permission', String)
)

class User(Base):
    """
    User model for authentication and user management.
    """
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    phone_number = Column(String)
    profile_image = Column(String)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Role-specific fields
    permissions = relationship('Permission', secondary=user_permission, back_populates='users')
    preferences = Column(JSONB, default={})
    
    # Relationships
    roles = relationship('Role', secondary=user_role, back_populates='users')
    # managed_branch_id = Column(Integer, ForeignKey('branches.id'))
    
    # Supplier-specific relationships
    # supplied_products = relationship("Product", back_populates="supplier")
    # Customer-specific relationships
    # favorite_products = relationship("Product", secondary="customer_favorite_products")
    # Cashier-specific relationships
    # transactions = relationship("Transaction", back_populates="cashier")
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        self.set_default_permissions()
    
    def set_default_permissions(self):
        """Set default permissions based on user role"""
        base_permissions = {
            "view_own_profile": True,
            "edit_own_profile": True
        }
        
        role_permissions = {
            UserRole.OWNER: {
                "manage_business": True,
                "manage_branches": True,
                "manage_users": True,
                "view_reports": True,
                "manage_products": True,
                "view_analytics": True,
                "manage_pricing": True
            },
            UserRole.BRANCH_MANAGER: {
                "manage_branch": True,
                "manage_staff": True,
                "view_branch_reports": True,
                "manage_inventory": True,
                "manage_schedules": True
            },
            UserRole.STAFF: {
                "view_assigned_tasks": True,
                "update_inventory": True,
                "view_schedules": True
            },
            UserRole.CASHIER: {
                "manage_sales": True,
                "view_products": True,
                "manage_transactions": True
            },
            UserRole.SUPPLIER: {
                "view_inventory": True,
                "view_product_alerts": True,
                "manage_supplies": True
            },
            UserRole.CUSTOMER: {
                "view_products": True,
                "place_orders": True,
                "view_order_history": True
            }
        }
        
        self.permissions = {
            **base_permissions,
            **(role_permissions.get(self.role, {}))
        }
    
    def set_password(self, password):
        """
        Set user password.
        
        Args:
            password (str): Password to set
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """
        Check user password.
        
        Args:
            password (str): Password to check
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)
    
    def get_id(self):
        """
        Get user ID.
        
        Returns:
            str: User ID
        """
        return str(self.id)
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission"""
        return self.permissions.get(permission, False)
    
    def can_manage_branch(self, branch_id: int) -> bool:
        """Check if user can manage specific branch"""
        if self.role == UserRole.OWNER:
            return True
        if self.role == UserRole.BRANCH_MANAGER:
            # return self.managed_branch_id == branch_id
            return False
        return False
    
    def can_access_branch(self, branch_id: int) -> bool:
        """Check if user has access to specific branch"""
        if self.role in [UserRole.OWNER, UserRole.BRANCH_MANAGER]:
            return self.can_manage_branch(branch_id)
        return any(branch.id == branch_id for branch in self.assigned_branches)
    
    @property
    def full_name(self) -> str:
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def to_dict(self) -> dict:
        """Convert user object to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "permissions": self.permissions,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }
    
    def update_last_login(self, session):
        """
        Update user's last login timestamp.
        """
        self.updated_at = datetime.utcnow()
        session.commit()
    
    def __repr__(self):
        return f'<User {self.email}>'

class UserProfile(Base):
    """
    User profile model for additional user information.
    """
    __tablename__ = 'user_profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    phone = Column(String(20))
    address = Column(String(200))
    avatar = Column(String(200))
    bio = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """
        Convert profile to dictionary.
        
        Returns:
            dict: Profile data
        """
        return {
            'id': self.id,
            'phone': self.phone,
            'address': self.address,
            'avatar': self.avatar,
            'bio': self.bio,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Notification(Base):
    """
    Notification model for user notifications.
    """
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String(100), nullable=False)
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """
        Convert notification to dictionary.
        
        Returns:
            dict: Notification data
        """
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }
    
    def mark_as_read(self, session):
        """
        Mark notification as read.
        """
        self.is_read = True
        session.commit()

# After all class definitions
User.owned_businesses = relationship("Business", back_populates="owner")
User.assigned_branches = relationship(
    "Branch",
    secondary=user_branches,
    back_populates="employees"
)
User.supplied_products = relationship("Product", back_populates="supplier")
# User.favorite_products = relationship("Product", secondary="customer_favorite_products")
User.transactions = relationship("Transaction", back_populates="cashier", foreign_keys=[Transaction.cashier_id])
User.managed_branches = relationship(
    "Branch",
    back_populates="manager",
    foreign_keys="Branch.manager_id"
) 
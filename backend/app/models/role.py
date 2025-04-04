from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base_class import Base

# Association table for role-permission relationship
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

# Association table for many-to-many relationship between users and roles
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True)
)

# Association table for role-permission many-to-many relationship
role_permission = Table(
    "role_permission",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("role.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permission.id"), primary_key=True),
)

class Role(Base):
    """
    Role model for role-based access control.
    """
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    users = relationship("User", secondary="user_role", back_populates="roles")
    permissions = relationship("Permission", secondary=role_permission, back_populates="roles")
    
    def __init__(self, name, description=None):
        self.name = name
        self.description = description
    
    def to_dict(self):
        """
        Convert role to dictionary.
        
        Returns:
            dict: Role data
        """
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'permissions': [permission.name for permission in self.permissions]
        }
    
    def has_permission(self, permission_name: str) -> bool:
        """
        Check if role has a specific permission.
        
        Args:
            permission_name (str): Name of permission to check
            
        Returns:
            bool: True if role has permission, False otherwise
        """
        return any(permission.name == permission_name for permission in self.permissions)
    
    def add_permission(self, permission):
        """
        Add a permission to the role.
        
        Args:
            permission (Permission): Permission to add
        """
        if permission not in self.permissions:
            self.permissions.append(permission)
    
    def remove_permission(self, permission):
        """
        Remove a permission from the role.
        
        Args:
            permission (Permission): Permission to remove
        """
        if permission in self.permissions:
            self.permissions.remove(permission)
    
    def __repr__(self):
        return f'<Role {self.name}>'

class Permission(Base):
    """
    Permission model for role-based access control.
    """
    __tablename__ = 'permissions'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200))
    category = Column(String(50), default='general')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, name, description=None, category='general'):
        self.name = name
        self.description = description
        self.category = category
    
    def to_dict(self):
        """
        Convert permission to dictionary.
        
        Returns:
            dict: Permission data
        """
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Permission {self.name}>' 
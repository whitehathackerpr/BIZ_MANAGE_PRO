from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..extensions import Base
from app.models.user import user_role  # Import the user_role table

# Association table for role-permission relationship
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

# Association table for role-permission many-to-many relationship (alternate implementation)
role_permission = Table(
    "role_permission",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True),
)

class Role(Base):
    """
    Role model for role-based access control.
    """
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", secondary="user_role", back_populates="roles")
    permissions = relationship("Permission", secondary=role_permission, back_populates="roles")
    
    def __init__(self, name: str, description: str = None):
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
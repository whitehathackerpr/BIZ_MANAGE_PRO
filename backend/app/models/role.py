from datetime import datetime
from ..extensions import db

# Association table for role-permission relationship
role_permissions = db.Table('role_permissions',
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permissions.id'), primary_key=True)
)

class Role(db.Model):
    """
    Role model for role-based access control.
    """
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    is_system = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='role', lazy=True)
    permissions = db.relationship('Permission', secondary=role_permissions,
                                backref=db.backref('roles', lazy=True))
    
    def __init__(self, name, description=None, is_system=False):
        self.name = name
        self.description = description
        self.is_system = is_system
    
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
            'is_system': self.is_system,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'permissions': [permission.to_dict() for permission in self.permissions]
        }
    
    def has_permission(self, permission_name):
        """
        Check if role has a specific permission.
        
        Args:
            permission_name (str): Name of permission to check
            
        Returns:
            bool: True if role has permission, False otherwise
        """
        return any(p.name == permission_name for p in self.permissions)
    
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

class Permission(db.Model):
    """
    Permission model for role-based access control.
    """
    __tablename__ = 'permissions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    category = db.Column(db.String(50), default='general')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
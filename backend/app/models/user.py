from datetime import datetime, UTC
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

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

class User(Base):
    """
    User model for authentication and user management.
    """
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    roles = relationship("Role", secondary=user_role, back_populates="users")
    profile = relationship('UserProfile', backref='user', uselist=False)
    notifications = relationship('Notification', backref='user', lazy='dynamic')
    permissions = relationship("Permission", secondary=user_permission, back_populates="users")
    
    def __init__(self, email, password=None, full_name=None, is_active=True, is_superuser=False):
        self.email = email
        if password:
            self.set_password(password)
        self.full_name = full_name
        self.is_active = is_active
        self.is_superuser = is_superuser
        self.created_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)
    
    def set_password(self, password):
        """
        Set user password.
        
        Args:
            password (str): Password to set
        """
        self.hashed_password = generate_password_hash(password)
    
    def check_password(self, password):
        """
        Check user password.
        
        Args:
            password (str): Password to check
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password_hash(self.hashed_password, password)
    
    def get_id(self):
        """
        Get user ID.
        
        Returns:
            str: User ID
        """
        return str(self.id)
    
    def has_permission(self, permission_name):
        """
        Check if user has a specific permission.
        
        Args:
            permission_name (str): Name of permission to check
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        if self.is_superuser:
            return True
        return self.roles and any(role.has_permission(permission_name) for role in self.roles)
    
    def to_dict(self):
        """
        Convert user to dictionary.
        
        Returns:
            dict: User data
        """
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'is_active': self.is_active,
            'is_superuser': self.is_superuser,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'roles': [role.to_dict() for role in self.roles],
            'profile': self.profile.to_dict() if self.profile else None
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
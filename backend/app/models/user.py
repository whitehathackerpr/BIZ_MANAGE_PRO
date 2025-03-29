from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db

class User(db.Model):
    """
    User model for authentication and user management.
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    profile = db.relationship('UserProfile', backref='user', uselist=False)
    notifications = db.relationship('Notification', backref='user', lazy=True)
    
    def __init__(self, username, email, password=None, first_name=None, last_name=None,
                 is_active=True, is_admin=False, role=None):
        self.username = username
        self.email = email
        if password:
            self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.is_active = is_active
        self.is_admin = is_admin
        if role:
            self.role = role
    
    def set_password(self, password):
        """
        Set user password.
        
        Args:
            password (str): Password to set
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """
        Check if password matches.
        
        Args:
            password (str): Password to check
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)
    
    def has_permission(self, permission_name):
        """
        Check if user has a specific permission.
        
        Args:
            permission_name (str): Name of permission to check
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        if self.is_admin:
            return True
        return self.role and self.role.has_permission(permission_name)
    
    def to_dict(self):
        """
        Convert user to dictionary.
        
        Returns:
            dict: User data
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'role': self.role.to_dict() if self.role else None,
            'profile': self.profile.to_dict() if self.profile else None
        }
    
    def update_last_login(self):
        """
        Update user's last login timestamp.
        """
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def __repr__(self):
        return f'<User {self.username}>'

class UserProfile(db.Model):
    """
    User profile model for additional user information.
    """
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    avatar = db.Column(db.String(200))
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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

class Notification(db.Model):
    """
    Notification model for user notifications.
    """
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
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
    
    def mark_as_read(self):
        """
        Mark notification as read.
        """
        self.is_read = True
        db.session.commit() 
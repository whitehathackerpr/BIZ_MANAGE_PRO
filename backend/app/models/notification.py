from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class Notification(Base):
    __tablename__ = 'notifications'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # warning, info, success
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship('User', backref=backref('notifications', lazy=True))

    def __repr__(self):
        return f'<Notification {self.id}: {self.title}>'

class NotificationSetting(Base):
    __tablename__ = 'notification_settings'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    
    # Email notification settings
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    in_app_notifications = Column(Boolean, default=True)
    low_stock_alerts = Column(Boolean, default=True)
    order_updates = Column(Boolean, default=True)
    system_alerts = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship('User', backref=backref('notification_settings', lazy=True, uselist=False))

    def to_dict(self):
        """
        Convert settings to dictionary.
        
        Returns:
            dict: Settings data
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'email_notifications': self.email_notifications,
            'push_notifications': self.push_notifications,
            'in_app_notifications': self.in_app_notifications,
            'low_stock_alerts': self.low_stock_alerts,
            'order_updates': self.order_updates,
            'system_alerts': self.system_alerts,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def update_from_dict(self, data):
        """
        Update settings from dictionary.
        
        Args:
            data (dict): Settings data to update
        """
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)

    @classmethod
    def get_or_create(cls, db_session, user_id):
        """
        Get user's notification settings or create default settings.
        
        Args:
            db_session: SQLAlchemy session
            user_id (int): ID of the user
            
        Returns:
            NotificationSetting: User's notification settings
        """
        settings = db_session.query(cls).filter_by(user_id=user_id).first()
        
        if not settings:
            settings = cls(user_id=user_id)
            db_session.add(settings)
            db_session.commit()
        
        return settings

    def __repr__(self):
        return f'<NotificationSetting {self.user_id}>'

class BranchNotification(Base):
    __tablename__ = 'branch_notifications'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # info, warning, error, success
    priority = Column(String(20), default='normal')  # low, normal, high
    status = Column(String(20), default='unread')  # unread, read, archived
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='notifications')
    creator = relationship('User', backref='created_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'priority': self.priority,
            'status': self.status,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchNotification {self.branch.name} - {self.title}>'

class BranchNotificationRecipient(Base):
    __tablename__ = 'branch_notification_recipients'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    notification_id = Column(Integer, ForeignKey('branch_notifications.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='unread')  # unread, read, archived
    read_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    notification = relationship('BranchNotification', backref='recipients')
    user = relationship('User', backref='received_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'notification_id': self.notification_id,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'status': self.status,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchNotificationRecipient {self.user.name} - {self.notification.title}>' 
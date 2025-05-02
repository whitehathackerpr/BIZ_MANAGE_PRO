from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..extensions import Base

class NotificationSetting(Base):
    """
    Model for user notification preferences.
    """
    __tablename__ = 'notification_settings'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    in_app_notifications = Column(Boolean, default=True)
    low_stock_alerts = Column(Boolean, default=True)
    order_updates = Column(Boolean, default=True)
    system_alerts = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', back_populates='notification_settings')
    
    def __init__(self, user_id, **kwargs):
        self.user_id = user_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
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
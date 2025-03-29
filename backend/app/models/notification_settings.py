from datetime import datetime
from ..extensions import db

class NotificationSetting(db.Model):
    """
    Model for user notification preferences.
    """
    __tablename__ = 'notification_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)
    in_app_notifications = db.Column(db.Boolean, default=True)
    low_stock_alerts = db.Column(db.Boolean, default=True)
    order_updates = db.Column(db.Boolean, default=True)
    system_alerts = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
    def get_or_create(cls, user_id):
        """
        Get user's notification settings or create default settings.
        
        Args:
            user_id (int): ID of the user
            
        Returns:
            NotificationSetting: User's notification settings
        """
        settings = cls.query.filter_by(user_id=user_id).first()
        
        if not settings:
            settings = cls(user_id=user_id)
            db.session.add(settings)
            db.session.commit()
        
        return settings
    
    def __repr__(self):
        return f'<NotificationSetting {self.user_id}>' 
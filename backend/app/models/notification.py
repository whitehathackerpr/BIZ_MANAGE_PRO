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
    email_low_stock = Column(Boolean, default=True)
    email_sales = Column(Boolean, default=True)
    email_attendance = Column(Boolean, default=True)
    
    # In-app notification settings
    in_app_low_stock = Column(Boolean, default=True)
    in_app_sales = Column(Boolean, default=True)
    in_app_attendance = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship('User', backref=backref('notification_settings', lazy=True, uselist=False))

    def __repr__(self):
        return f'<NotificationSetting {self.id}: User {self.user_id}>' 
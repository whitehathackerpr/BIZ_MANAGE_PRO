from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..extensions import Base

class Session(Base):
    __tablename__ = 'user_sessions'
    
    id = Column(String(36), primary_key=True)  # UUID string
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    device_info = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 can be up to 45 chars
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    last_activity = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', back_populates='sessions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'device_info': self.device_info,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None
        }
    
    def __repr__(self):
        return f'<Session {self.id}>' 
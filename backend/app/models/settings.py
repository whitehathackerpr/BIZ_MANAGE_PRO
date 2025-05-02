from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class SystemSetting(Base):
    __tablename__ = 'system_settings'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    dark_mode = Column(Boolean, default=False)
    email_notifications = Column(Boolean, default=True)
    two_factor_auth = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship('User', backref=backref('system_settings', lazy=True))

    def __repr__(self):
        return f'<SystemSetting {self.user_id}>'

class BranchSettings(Base):
    __tablename__ = 'branch_settings'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    operating_hours = Column(JSON, nullable=False)
    inventory_settings = Column(JSON, nullable=False)
    sales_settings = Column(JSON, nullable=False)
    notification_settings = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='settings')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'operating_hours': self.operating_hours,
            'inventory_settings': self.inventory_settings,
            'sales_settings': self.sales_settings,
            'notification_settings': self.notification_settings,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchSettings {self.branch.name}>'

class BranchUserSettings(Base):
    __tablename__ = 'branch_user_settings'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    role = Column(String(50), nullable=False)
    permissions = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='user_settings')
    user = relationship('User', backref='branch_settings')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'role': self.role,
            'permissions': self.permissions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchUserSettings {self.branch.name} - {self.user.name}>' 
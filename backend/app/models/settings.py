from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class Business(Base):
    __tablename__ = 'businesses'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    address = Column(String(200))
    city = Column(String(100))
    state = Column(String(100))
    zip_code = Column(String(20))
    country = Column(String(100))
    phone = Column(String(20))
    email = Column(String(120))
    tax_id = Column(String(50))
    currency = Column(String(3), default='USD')
    timezone = Column(String(50), default='UTC')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Business {self.name}>'

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
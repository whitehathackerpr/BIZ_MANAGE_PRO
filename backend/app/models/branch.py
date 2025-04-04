from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..extensions import Base

class Branch(Base):
    __tablename__ = 'branches'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255))
    phone = Column(String(20))
    email = Column(String(120))
    manager_id = Column(Integer, ForeignKey('users.id'))
    status = Column(String(20), default='active')  # active, inactive, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    settings = Column(JSON, default={
        'operating_hours': {
            'monday': {'open': '09:00', 'close': '17:00'},
            'tuesday': {'open': '09:00', 'close': '17:00'},
            'wednesday': {'open': '09:00', 'close': '17:00'},
            'thursday': {'open': '09:00', 'close': '17:00'},
            'friday': {'open': '09:00', 'close': '17:00'},
            'saturday': {'open': '10:00', 'close': '16:00'},
            'sunday': {'open': '10:00', 'close': '16:00'}
        },
        'inventory_settings': {
            'low_stock_threshold': 10,
            'auto_reorder': False,
            'reorder_point': 5
        },
        'sales_settings': {
            'allow_discounts': True,
            'max_discount_percentage': 20,
            'require_manager_approval': True
        },
        'notification_settings': {
            'low_stock_alerts': True,
            'daily_sales_report': True,
            'weekly_inventory_report': True
        }
    })

    # Relationships
    manager = relationship('User', foreign_keys=[manager_id], backref='managed_branches')
    employees = relationship('Employee', backref='branch', lazy=True)
    users = relationship('User', foreign_keys='User.branch_id', backref='branch')
    inventory = relationship('BranchInventory', backref='branch', lazy=True)
    sales = relationship('Sale', backref='branch', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'manager_id': self.manager_id,
            'manager_name': self.manager.name if self.manager else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'settings': self.settings
        }

    def __repr__(self):
        return f'<Branch {self.name}>' 
from datetime import datetime
from ..extensions import db

class Branch(db.Model):
    __tablename__ = 'branches'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(20), default='active')  # active, inactive, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    settings = db.Column(db.JSON, default={
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
    manager = db.relationship('User', foreign_keys=[manager_id], backref='managed_branches')
    employees = db.relationship('Employee', backref='branch', lazy=True)
    users = db.relationship('User', foreign_keys='User.branch_id', backref='branch')
    inventory = db.relationship('BranchInventory', backref='branch', lazy=True)
    sales = db.relationship('Sale', backref='branch', lazy=True)

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
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..extensions import Base
from typing import List
from datetime import datetime

class Inventory(Base):
    __tablename__ = 'inventory'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, default=0)
    minimum_stock = Column(Integer, default=10)
    maximum_stock = Column(Integer, default=100)
    reorder_point = Column(Integer, default=20)
    reorder_quantity = Column(Integer, default=50)
    location = Column(String(100))  # Storage location within branch
    batch_number = Column(String(100))
    expiry_date = Column(DateTime(timezone=True))
    last_restock_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    branch = relationship('Branch', back_populates='inventory')
    product = relationship('Product', back_populates='inventory_items')
    stock_movements = relationship('StockMovement', back_populates='inventory_item')

    def __init__(self, branch_id: int, product_id: int, quantity: int = 0, **kwargs):
        super().__init__(**kwargs)
        self.branch_id = branch_id
        self.product_id = product_id
        self.quantity = quantity

    def add_stock(self, quantity: int, batch_number: str = None, expiry_date: datetime = None) -> None:
        """Add stock to inventory"""
        self.quantity += quantity
        if batch_number:
            self.batch_number = batch_number
        if expiry_date:
            self.expiry_date = expiry_date
        self.last_restock_date = datetime.now()

    def remove_stock(self, quantity: int) -> bool:
        """Remove stock from inventory"""
        if self.quantity >= quantity:
            self.quantity -= quantity
            return True
        return False

    def is_low_stock(self) -> bool:
        """Check if inventory is below reorder point"""
        return self.quantity <= self.reorder_point

    def needs_restock(self) -> bool:
        """Check if inventory needs restocking"""
        return self.quantity < self.minimum_stock

    def can_add_stock(self, quantity: int) -> bool:
        """Check if adding stock would exceed maximum"""
        return (self.quantity + quantity) <= self.maximum_stock

    def is_expired(self) -> bool:
        """Check if inventory is expired"""
        if self.expiry_date:
            return datetime.now() > self.expiry_date
        return False

    def days_until_expiry(self) -> int:
        """Calculate days until expiry"""
        if self.expiry_date:
            delta = self.expiry_date - datetime.now()
            return max(0, delta.days)
        return None

    def to_dict(self) -> dict:
        """Convert inventory object to dictionary"""
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'minimum_stock': self.minimum_stock,
            'maximum_stock': self.maximum_stock,
            'reorder_point': self.reorder_point,
            'reorder_quantity': self.reorder_quantity,
            'location': self.location,
            'batch_number': self.batch_number,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'last_restock_date': self.last_restock_date.isoformat() if self.last_restock_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_low_stock': self.is_low_stock(),
            'needs_restock': self.needs_restock(),
            'is_expired': self.is_expired(),
            'days_until_expiry': self.days_until_expiry()
        }

    def __repr__(self) -> str:
        return f"<Inventory {self.product_id} at Branch {self.branch_id}>"

class StockMovement(Base):
    __tablename__ = 'stock_movements'

    id = Column(Integer, primary_key=True)
    inventory_id = Column(Integer, ForeignKey('inventory.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    movement_type = Column(String(50), nullable=False)  # in, out, transfer, adjustment
    reference = Column(String(100))  # PO number, SO number, etc.
    notes = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Relationships
    inventory_item = relationship('Inventory', back_populates='stock_movements')
    user = relationship('User')

    def __init__(self, inventory_id: int, quantity: int, movement_type: str, created_by: int, **kwargs):
        super().__init__(**kwargs)
        self.inventory_id = inventory_id
        self.quantity = quantity
        self.movement_type = movement_type
        self.created_by = created_by

    def to_dict(self) -> dict:
        """Convert stock movement to dictionary"""
        return {
            'id': self.id,
            'inventory_id': self.inventory_id,
            'quantity': self.quantity,
            'movement_type': self.movement_type,
            'reference': self.reference,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by
        }

    def __repr__(self) -> str:
        return f"<StockMovement {self.movement_type} {self.quantity} units>"

class BranchInventory(db.Model):
    __tablename__ = 'branch_inventory'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    min_stock_level = db.Column(db.Integer, default=0)
    max_stock_level = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = db.relationship('Product', backref='branch_inventory')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'product_id': self.product_id,
            'product_name': self.product.name,
            'sku': self.product.sku,
            'quantity': self.quantity,
            'min_stock_level': self.min_stock_level,
            'max_stock_level': self.max_stock_level,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchInventory {self.product.name} - {self.quantity}>'

class InventoryTransfer(db.Model):
    __tablename__ = 'inventory_transfers'

    id = db.Column(db.Integer, primary_key=True)
    source_branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    target_branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, completed, cancelled
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    source_branch = db.relationship('Branch', foreign_keys=[source_branch_id], backref='outgoing_transfers')
    target_branch = db.relationship('Branch', foreign_keys=[target_branch_id], backref='incoming_transfers')
    product = db.relationship('Product', backref='transfers')
    requester = db.relationship('User', foreign_keys=[requested_by], backref='requested_transfers')
    approver = db.relationship('User', foreign_keys=[approved_by], backref='approved_transfers')

    def to_dict(self):
        return {
            'id': self.id,
            'source_branch_id': self.source_branch_id,
            'source_branch_name': self.source_branch.name,
            'target_branch_id': self.target_branch_id,
            'target_branch_name': self.target_branch.name,
            'product_id': self.product_id,
            'product_name': self.product.name,
            'quantity': self.quantity,
            'status': self.status,
            'requested_by': self.requested_by,
            'requester_name': self.requester.name,
            'approved_by': self.approved_by,
            'approver_name': self.approver.name if self.approver else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<InventoryTransfer {self.product.name} - {self.quantity}>' 
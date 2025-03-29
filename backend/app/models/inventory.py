from app import db
from datetime import datetime

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
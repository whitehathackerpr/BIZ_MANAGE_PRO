from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property
from ..extensions import db

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # income, expense
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    reference_number = db.Column(db.String(50))
    payment_method = db.Column(db.String(50))
    status = db.Column(db.String(20), default='completed')  # pending, completed, failed, cancelled
    date = db.Column(db.DateTime, nullable=False)
    due_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'))
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    sale = db.relationship('Sale', backref='transactions')
    order = db.relationship('Order', backref='transactions')
    
    @hybrid_property
    def formatted_amount(self):
        return f"${self.amount:.2f}"
    
    @hybrid_property
    def is_income(self):
        return self.type == 'income'
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'amount': float(self.amount),
            'description': self.description,
            'category': self.category,
            'reference_number': self.reference_number,
            'payment_method': self.payment_method,
            'status': self.status,
            'date': self.date.isoformat() if self.date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'notes': self.notes,
            'sale_id': self.sale_id,
            'order_id': self.order_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Transaction {self.type} {self.formatted_amount}>'

class TransactionCategory(db.Model):
    __tablename__ = 'transaction_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # income, expense
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='category', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<TransactionCategory {self.name}>' 
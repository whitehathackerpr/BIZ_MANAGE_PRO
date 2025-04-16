from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..extensions import Base

class Transaction(Base):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True)
    type = Column(String(20), nullable=False)  # income, expense
    amount = Column(Float, nullable=False)
    description = Column(Text)
    category = Column(String(50))
    reference_number = Column(String(50))
    payment_method = Column(String(50))
    status = Column(String(20), default='completed')  # pending, completed, failed, cancelled
    date = Column(DateTime, nullable=False)
    due_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sale_id = Column(Integer, ForeignKey('sales.id'))
    order_id = Column(Integer, ForeignKey('orders.id'))
    sale = relationship('Sale', backref='transactions')
    order = relationship('Order', backref='transactions')
    
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

class TransactionCategory(Base):
    __tablename__ = 'transaction_categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    type = Column(String(20), nullable=False)  # income, expense
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = relationship('Transaction', backref='category', lazy='dynamic')
    
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
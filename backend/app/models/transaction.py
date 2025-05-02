from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..extensions import Base
from typing import List
import enum

class TransactionType(str, enum.Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    MOBILE_PAYMENT = "mobile_payment"
    CHEQUE = "cheque"

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    FAILED = "failed"

class Transaction(Base):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    customer_id = Column(Integer, ForeignKey('users.id'))
    cashier_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    payment_method = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default=TransactionStatus.PENDING)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    discount = Column(Float, default=0)
    total = Column(Float, nullable=False)
    notes = Column(String(500))
    reference = Column(String(100))  # Invoice number, receipt number, etc.
    payment_details = Column(JSON)  # Store payment-specific details
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    transaction_category_id = Column(Integer, ForeignKey('transaction_categories.id'))
    
    # Relationships
    branch = relationship('Branch', back_populates='transactions')
    customer = relationship('User', foreign_keys=[customer_id])
    cashier = relationship('User', foreign_keys=[cashier_id])
    items = relationship('TransactionItem', back_populates='transaction', cascade='all, delete-orphan')
    category = relationship('TransactionCategory', back_populates='transactions', foreign_keys=[transaction_category_id])
    
    def __init__(self, branch_id: int, cashier_id: int, transaction_type: str, 
                 payment_method: str, subtotal: float, total: float, **kwargs):
        super().__init__(**kwargs)
        self.branch_id = branch_id
        self.cashier_id = cashier_id
        self.transaction_type = transaction_type
        self.payment_method = payment_method
        self.subtotal = subtotal
        self.total = total

    def add_item(self, product_id: int, quantity: int, unit_price: float) -> 'TransactionItem':
        """Add an item to the transaction"""
        item = TransactionItem(
            transaction_id=self.id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price
        )
        self.items.append(item)
        return item

    def calculate_totals(self) -> None:
        """Calculate transaction totals"""
        self.subtotal = sum(item.total for item in self.items)
        self.total = self.subtotal + self.tax - self.discount

    def complete(self) -> None:
        """Mark transaction as completed"""
        self.status = TransactionStatus.COMPLETED
        self.updated_at = datetime.now()

    def cancel(self) -> None:
        """Cancel the transaction"""
        self.status = TransactionStatus.CANCELLED
        self.updated_at = datetime.now()

    def refund(self) -> None:
        """Mark transaction as refunded"""
        self.status = TransactionStatus.REFUNDED
        self.updated_at = datetime.now()

    def to_dict(self) -> dict:
        """Convert transaction object to dictionary"""
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'customer_id': self.customer_id,
            'cashier_id': self.cashier_id,
            'transaction_type': self.transaction_type,
            'payment_method': self.payment_method,
            'status': self.status,
            'subtotal': self.subtotal,
            'tax': self.tax,
            'discount': self.discount,
            'total': self.total,
            'notes': self.notes,
            'reference': self.reference,
            'payment_details': self.payment_details,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items]
        }

    def __repr__(self) -> str:
        return f"<Transaction {self.id} ({self.status})>"

class TransactionItem(Base):
    __tablename__ = 'transaction_items'
    
    id = Column(Integer, primary_key=True)
    transaction_id = Column(Integer, ForeignKey('transactions.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0)
    notes = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    transaction = relationship('Transaction', back_populates='items')
    product = relationship('Product')
    
    def __init__(self, transaction_id: int, product_id: int, quantity: int, unit_price: float, **kwargs):
        super().__init__(**kwargs)
        self.transaction_id = transaction_id
        self.product_id = product_id
        self.quantity = quantity
        self.unit_price = unit_price

    @property
    def total(self) -> float:
        """Calculate total for this item"""
        return (self.quantity * self.unit_price) - self.discount

    def to_dict(self) -> dict:
        """Convert transaction item to dictionary"""
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'discount': self.discount,
            'total': self.total,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self) -> str:
        return f"<TransactionItem {self.product_id} x{self.quantity}>"

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
    transactions = relationship('Transaction', back_populates='category', foreign_keys='Transaction.transaction_category_id')
    
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
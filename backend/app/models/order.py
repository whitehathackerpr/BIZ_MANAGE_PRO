from datetime import datetime
import random
import string
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Numeric
from sqlalchemy.orm import relationship
from ..extensions import Base

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True)
    order_number = Column(String(32), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    total_amount = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    status = Column(String(20), default='pending')
    payment_status = Column(String(20), default='pending')
    shipping_address_id = Column(Integer, ForeignKey('addresses.id'))
    billing_address_id = Column(Integer, ForeignKey('addresses.id'))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    branch_id = Column(Integer, ForeignKey('branches.id'))
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=True)
    
    # Relationships
    items = relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    payments = relationship('Payment', backref='order', lazy='dynamic')
    shipping_address = relationship('Address', foreign_keys=[shipping_address_id])
    billing_address = relationship('Address', foreign_keys=[billing_address_id])
    branch = relationship('Branch', back_populates='orders')
    customer = relationship('Customer', backref='orders')
    
    @hybrid_property
    def status_display(self):
        return self.status.capitalize()
    
    @hybrid_property
    def formatted_total(self):
        return f"${self.total_amount:.2f}"
    
    def __repr__(self):
        return f'<Order {self.order_number}>'
    
    def generate_order_number(self):
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M')
        random_suffix = ''.join(random.choices(string.digits, k=4))
        return f'ORD-{timestamp}-{random_suffix}'
    
    def calculate_totals(self):
        self.subtotal = sum(item.subtotal for item in self.items)
        self.total_amount = self.subtotal + self.shipping_cost + self.tax_amount - self.discount_amount
        return self.total_amount
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'status': self.status,
            'payment_status': self.payment_status,
            'subtotal': float(self.subtotal),
            'total_amount': float(self.total_amount),
            'shipping_cost': float(self.shipping_cost),
            'tax_amount': float(self.tax_amount),
            'discount_amount': float(self.discount_amount),
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items],
            'shipping_address': self.shipping_address.to_dict() if self.shipping_address else None,
            'billing_address': self.billing_address.to_dict() if self.billing_address else None
        }

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    variant_id = Column(Integer, ForeignKey('product_variants.id'))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    notes = Column(Text)
    
    # Relationships
    product = relationship('Product', backref='order_items')
    variant = relationship('ProductVariant')
    
    @hybrid_property
    def subtotal(self):
        return (self.quantity * self.price) - self.discount
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product.to_dict(),
            'variant': self.variant.to_dict() if self.variant else None,
            'quantity': self.quantity,
            'price': float(self.price),
            'discount': float(self.discount),
            'subtotal': float(self.subtotal),
            'notes': self.notes
        }

class Payment(Base):
    __tablename__ = 'payments'
    
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(64), nullable=False)
    transaction_id = Column(String(128))
    status = Column(String(32), default='pending')
    payment_date = Column(DateTime)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'amount': float(self.amount),
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 
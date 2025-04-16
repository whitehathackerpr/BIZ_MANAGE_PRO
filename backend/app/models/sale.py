from datetime import datetime
import random
import string
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Numeric
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class Sale(Base):
    __tablename__ = 'sales'
    
    id = Column(Integer, primary_key=True)
    sale_number = Column(String(32), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=True)
    total_amount = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    payment_method = Column(String(20), nullable=False)
    payment_status = Column(String(20), default='completed')
    status = Column(String(20), default='completed')
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = relationship('SaleItem', backref='sale', lazy='dynamic', cascade='all, delete-orphan')
    customer = relationship('Customer', backref='sales')
    created_by_user = relationship('User', backref='sales_created')
    
    @hybrid_property
    def status_display(self):
        return self.status.capitalize()
    
    @hybrid_property
    def formatted_total(self):
        return f"${self.total_amount:.2f}"
    
    def __repr__(self):
        return f'<Sale {self.sale_number}>'
    
    def generate_sale_number(self):
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M')
        random_suffix = ''.join(random.choices(string.digits, k=4))
        return f'SL-{timestamp}-{random_suffix}'
    
    def calculate_totals(self):
        self.subtotal = sum(item.subtotal for item in self.items)
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount
        return self.total_amount
    
    def to_dict(self):
        return {
            'id': self.id,
            'sale_number': self.sale_number,
            'customer': self.customer.to_dict() if self.customer else None,
            'status': self.status,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'subtotal': float(self.subtotal),
            'total_amount': float(self.total_amount),
            'tax_amount': float(self.tax_amount),
            'discount_amount': float(self.discount_amount),
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items],
            'created_by': self.created_by
        }

class SaleItem(Base):
    __tablename__ = 'sale_items'
    
    id = Column(Integer, primary_key=True)
    sale_id = Column(Integer, ForeignKey('sales.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    variant_id = Column(Integer, ForeignKey('product_variants.id'))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    notes = Column(Text)
    
    # Relationships
    product = relationship('Product', backref='sale_items')
    variant = relationship('ProductVariant')
    
    @hybrid_property
    def subtotal(self):
        return (self.quantity * self.price) - self.discount
    
    def __repr__(self):
        return f'<SaleItem {self.id}>'
    
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
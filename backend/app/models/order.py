from datetime import datetime
import random
import string
from sqlalchemy.ext.hybrid import hybrid_property
from ..extensions import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(32), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, default=0.0)
    shipping_cost = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='pending')
    payment_status = db.Column(db.String(20), default='pending')
    shipping_address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'))
    billing_address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='order', lazy='dynamic')
    shipping_address = db.relationship('Address', foreign_keys=[shipping_address_id])
    billing_address = db.relationship('Address', foreign_keys=[billing_address_id])
    
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

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id'))
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text)
    
    # Relationships
    product = db.relationship('Product', backref='order_items')
    variant = db.relationship('ProductVariant')
    
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

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(64), nullable=False)
    transaction_id = db.Column(db.String(128))
    status = db.Column(db.String(32), default='pending')
    payment_date = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
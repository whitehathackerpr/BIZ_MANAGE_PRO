from datetime import datetime
import random
import string
from app import db
from .address import Address

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    
    @property
    def status_display(self):
        return self.status.capitalize()
    
    @property
    def formatted_total(self):
        return f"${self.total_amount:.2f}"
    
    def __repr__(self):
        return f'<Order {self.id}>'
    
    def generate_order_number(self):
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M')
        random_suffix = ''.join(random.choices(string.digits, k=4))
        return f'ORD-{timestamp}-{random_suffix}'
    
    def calculate_totals(self):
        subtotal = sum(item.subtotal for item in self.items)
        self.total_amount = subtotal + self.shipping_cost + self.tax_amount
        return self.total_amount
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'status': self.status,
            'total_amount': float(self.total_amount),
            'shipping_cost': float(self.shipping_cost),
            'tax_amount': float(self.tax_amount),
            'created_at': self.created_at.isoformat(),
            'items': [item.to_dict() for item in self.items],
            'shipping_address': self.shipping_address.to_dict() if self.shipping_address else None,
            'billing_address': self.billing_address.to_dict() if self.billing_address else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    
    # Relationships
    product = db.relationship('Product', backref='order_items')
    
    @property
    def subtotal(self):
        return self.quantity * self.price
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product.to_dict(),
            'quantity': self.quantity,
            'price': float(self.price),
            'subtotal': float(self.subtotal)
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(64), nullable=False)
    transaction_id = db.Column(db.String(128))
    status = db.Column(db.String(32), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 
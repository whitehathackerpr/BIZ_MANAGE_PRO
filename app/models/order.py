from datetime import datetime
import random
import string
from app.extensions import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    
    # Relationships
    user = db.relationship('User', back_populates='orders')
    
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
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variant.id'))
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    
    @property
    def subtotal(self):
        return self.price * self.quantity
    
    def to_dict(self):
        return {
            'id': self.id,
            'product': self.product.to_dict(),
            'variant': self.variant.to_dict() if self.variant else None,
            'quantity': self.quantity,
            'price': float(self.price),
            'subtotal': float(self.subtotal)
        }

class Address(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String(128), nullable=False)
    street = db.Column(db.String(256), nullable=False)
    city = db.Column(db.String(128), nullable=False)
    state = db.Column(db.String(128), nullable=False)
    postal_code = db.Column(db.String(32), nullable=False)
    country = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(32))
    is_default = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'street': self.street,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'phone': self.phone
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(64), nullable=False)
    transaction_id = db.Column(db.String(128))
    status = db.Column(db.String(32), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 
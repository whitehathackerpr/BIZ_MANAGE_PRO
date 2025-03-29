from datetime import datetime
from ..extensions import db

class Address(db.Model):
    __tablename__ = 'addresses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100))  # Name for the address (e.g., "Home", "Office")
    street = db.Column(db.String(255), nullable=False)
    apartment = db.Column(db.String(100))  # Apartment, suite, unit, etc.
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    is_default = db.Column(db.Boolean, default=False)
    is_billing = db.Column(db.Boolean, default=False)
    is_shipping = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('addresses', lazy='dynamic'))
    
    @property
    def full_address(self):
        parts = [self.street]
        if self.apartment:
            parts.append(self.apartment)
        parts.extend([self.city, self.state, self.postal_code, self.country])
        return ', '.join(parts)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'street': self.street,
            'apartment': self.apartment,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'phone': self.phone,
            'is_default': self.is_default,
            'is_billing': self.is_billing,
            'is_shipping': self.is_shipping,
            'full_address': self.full_address,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Address {self.street}, {self.city}>' 
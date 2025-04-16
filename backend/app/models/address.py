from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class Address(Base):
    __tablename__ = 'addresses'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100))  # Name for the address (e.g., "Home", "Office")
    street = Column(String(255), nullable=False)
    apartment = Column(String(100))  # Apartment, suite, unit, etc.
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    phone = Column(String(20))
    is_default = Column(Boolean, default=False)
    is_billing = Column(Boolean, default=False)
    is_shipping = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', backref=backref('addresses', lazy='dynamic'))
    
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
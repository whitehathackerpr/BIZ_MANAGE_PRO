from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..extensions import Base

class Customer(Base):
    """
    Customer model for managing customer information.
    """
    __tablename__ = 'customers'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20))
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sales = relationship('Sale', back_populates='customer')
    
    def __repr__(self):
        return f'<Customer {self.name}>'
    
    def to_dict(self):
        """
        Convert customer to dictionary.
        
        Returns:
            dict: Customer data
        """
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 
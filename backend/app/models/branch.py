from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..extensions import Base
from typing import List
from datetime import datetime

class Branch(Base):
    __tablename__ = 'branches'

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    manager_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    phone = Column(String(20))
    email = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    opening_hours = Column(String(500))  # JSON string of opening hours
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    business = relationship('Business', back_populates='branches')
    manager = relationship('User', back_populates='managed_branches', foreign_keys=[manager_id])
    employees = relationship('User', secondary='user_branches', back_populates='branches')
    inventory = relationship('Inventory', back_populates='branch', cascade='all, delete-orphan')
    transactions = relationship('Transaction', back_populates='branch')
    orders = relationship('Order', back_populates='branch')

    def __init__(self, name: str, business_id: int, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.business_id = business_id

    def assign_manager(self, manager_id: int) -> None:
        """Assign a manager to the branch"""
        self.manager_id = manager_id

    def add_employee(self, employee: 'User') -> None:
        """Add an employee to the branch"""
        if employee not in self.employees:
            self.employees.append(employee)

    def remove_employee(self, employee_id: int) -> bool:
        """Remove an employee from the branch"""
        employee = next((e for e in self.employees if e.id == employee_id), None)
        if employee:
            self.employees.remove(employee)
            return True
        return False

    def get_active_employees(self) -> List['User']:
        """Get all active employees of the branch"""
        return [emp for emp in self.employees if emp.is_active]

    def get_inventory_status(self) -> dict:
        """Get current inventory status"""
        return {
            'total_items': len(self.inventory),
            'low_stock_items': len([item for item in self.inventory if item.is_low_stock()]),
            'out_of_stock_items': len([item for item in self.inventory if item.quantity == 0])
        }

    def get_daily_transactions(self, date: datetime) -> List['Transaction']:
        """Get all transactions for a specific date"""
        return [t for t in self.transactions if t.created_at.date() == date.date()]

    def to_dict(self) -> dict:
        """Convert branch object to dictionary"""
        return {
            'id': self.id,
            'business_id': self.business_id,
            'manager_id': self.manager_id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'phone': self.phone,
            'email': self.email,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'is_active': self.is_active,
            'opening_hours': self.opening_hours,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'employee_count': len(self.employees),
            'active_employee_count': len(self.get_active_employees())
        }

    def __repr__(self) -> str:
        return f"<Branch {self.name} (ID: {self.id})>" 
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..extensions import Base
from typing import List
from datetime import datetime

class Business(Base):
    __tablename__ = 'businesses'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    description = Column(String(1000))
    registration_number = Column(String(100), unique=True)
    tax_id = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship('User', back_populates='owned_businesses')
    branches = relationship('Branch', back_populates='business', cascade='all, delete-orphan')
    products = relationship('Product', back_populates='business')
    suppliers = relationship('User', secondary='business_suppliers', 
                           primaryjoin='Business.id == business_suppliers.c.business_id',
                           secondaryjoin='User.id == business_suppliers.c.supplier_id')

    def __init__(self, name: str, owner_id: int, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.owner_id = owner_id

    def add_branch(self, branch: 'Branch') -> None:
        """Add a new branch to the business"""
        self.branches.append(branch)

    def remove_branch(self, branch_id: int) -> bool:
        """Remove a branch from the business"""
        branch = next((b for b in self.branches if b.id == branch_id), None)
        if branch:
            self.branches.remove(branch)
            return True
        return False

    def get_active_branches(self) -> List['Branch']:
        """Get all active branches of the business"""
        return [branch for branch in self.branches if branch.is_active]

    def get_branch_by_id(self, branch_id: int) -> 'Branch':
        """Get a specific branch by ID"""
        return next((b for b in self.branches if b.id == branch_id), None)

    def to_dict(self) -> dict:
        """Convert business object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'owner_id': self.owner_id,
            'description': self.description,
            'registration_number': self.registration_number,
            'tax_id': self.tax_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'branch_count': len(self.branches),
            'active_branch_count': len(self.get_active_branches())
        }

    def __repr__(self) -> str:
        return f"<Business {self.name} (ID: {self.id})>" 
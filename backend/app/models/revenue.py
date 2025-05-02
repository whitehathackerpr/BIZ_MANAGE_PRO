from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from .base import Base

class Revenue(Base):
    __tablename__ = "revenue"
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'))
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    # Relationships
    branch = relationship('Branch')
    def __repr__(self):
        return f'<Revenue {self.id}>' 
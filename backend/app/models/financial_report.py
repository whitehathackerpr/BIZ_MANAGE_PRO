from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from .base import Base

class FinancialReport(Base):
    __tablename__ = "financial_report"
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_revenue = Column(Float, nullable=False)
    total_expenses = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    report_type = Column(String(20), nullable=False)  # daily, weekly, monthly, yearly
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    # Relationships
    branch = relationship('Branch')
    def __repr__(self):
        return f'<FinancialReport {self.id}>' 
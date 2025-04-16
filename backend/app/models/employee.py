from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class Employee(Base):
    __tablename__ = 'employees'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    employee_id = Column(String(20), unique=True, nullable=False)
    position = Column(String(100), nullable=False)
    department = Column(String(100))
    hire_date = Column(Date, nullable=False)
    salary = Column(Float)
    commission_rate = Column(Float)
    tax_id = Column(String(50))
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(20))
    bank_account = Column(String(50))
    bank_name = Column(String(100))
    bank_routing = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', backref=backref('employee', uselist=False))
    attendance_records = relationship('Attendance', backref='employee', lazy='dynamic')
    performance_reviews = relationship('PerformanceReview', backref='employee', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'employee_id': self.employee_id,
            'position': self.position,
            'department': self.department,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'salary': float(self.salary) if self.salary else None,
            'commission_rate': float(self.commission_rate) if self.commission_rate else None,
            'tax_id': self.tax_id,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'bank_account': self.bank_account,
            'bank_name': self.bank_name,
            'bank_routing': self.bank_routing,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None
        }
    
    def __repr__(self):
        return f'<Employee {self.employee_id}>'

class Attendance(Base):
    __tablename__ = 'attendance'
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime)
    check_out = Column(DateTime)
    status = Column(String(20), default='present')  # present, absent, late, early_leave
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'date': self.date.isoformat() if self.date else None,
            'check_in': self.check_in.isoformat() if self.check_in else None,
            'check_out': self.check_out.isoformat() if self.check_out else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Attendance {self.employee_id} {self.date}>'

class PerformanceReview(Base):
    __tablename__ = 'performance_reviews'
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    reviewer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    review_date = Column(Date, nullable=False)
    rating = Column(Integer)  # 1-5 rating
    strengths = Column(Text)
    weaknesses = Column(Text)
    goals = Column(Text)
    comments = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviewer = relationship('User', backref='reviews_given')
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'reviewer_id': self.reviewer_id,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'rating': self.rating,
            'strengths': self.strengths,
            'weaknesses': self.weaknesses,
            'goals': self.goals,
            'comments': self.comments,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'reviewer': self.reviewer.to_dict() if self.reviewer else None
        }
    
    def __repr__(self):
        return f'<PerformanceReview {self.employee_id} {self.review_date}>' 
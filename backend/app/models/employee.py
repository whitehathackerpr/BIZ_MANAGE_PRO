from datetime import datetime
from ..extensions import db

class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    employee_id = db.Column(db.String(20), unique=True, nullable=False)
    position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    hire_date = db.Column(db.Date, nullable=False)
    salary = db.Column(db.Float)
    commission_rate = db.Column(db.Float)
    tax_id = db.Column(db.String(50))
    emergency_contact = db.Column(db.String(100))
    emergency_phone = db.Column(db.String(20))
    bank_account = db.Column(db.String(50))
    bank_name = db.Column(db.String(100))
    bank_routing = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('employee', uselist=False))
    attendance_records = db.relationship('Attendance', backref='employee', lazy='dynamic')
    performance_reviews = db.relationship('PerformanceReview', backref='employee', lazy='dynamic')
    
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

class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='present')  # present, absent, late, early_leave
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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

class PerformanceReview(db.Model):
    __tablename__ = 'performance_reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    review_date = db.Column(db.Date, nullable=False)
    rating = db.Column(db.Integer)  # 1-5 rating
    strengths = db.Column(db.Text)
    weaknesses = db.Column(db.Text)
    goals = db.Column(db.Text)
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviewer = db.relationship('User', backref='reviews_given')
    
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
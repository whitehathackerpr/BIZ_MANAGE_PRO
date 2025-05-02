from ..extensions import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Date, Time
from sqlalchemy.orm import relationship
from datetime import datetime

class BranchService(Base):
    __tablename__ = 'branch_services'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration = Column(Integer)  # Duration in minutes
    category = Column(String(100))
    status = Column(String(20), default='active')  # active, inactive, discontinued
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='services')
    schedules = relationship('BranchServiceSchedule', back_populates='service')
    appointments = relationship('BranchServiceAppointment', back_populates='service')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'duration': self.duration,
            'category': self.category,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchService {self.branch.name} - {self.name}>'

class BranchServiceSchedule(Base):
    __tablename__ = 'branch_service_schedules'

    id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey('branch_services.id'), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0-6 for Monday-Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    max_appointments = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship('BranchService', back_populates='schedules')
    appointments = relationship('BranchServiceAppointment', back_populates='schedule')

    def to_dict(self):
        return {
            'id': self.id,
            'service_id': self.service_id,
            'service_name': self.service.name,
            'branch_name': self.service.branch.name,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time.strftime('%H:%M'),
            'end_time': self.end_time.strftime('%H:%M'),
            'max_appointments': self.max_appointments,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchServiceSchedule {self.service.name} - {self.day_of_week}>'

class BranchServiceAppointment(Base):
    __tablename__ = 'branch_service_appointments'

    id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey('branch_services.id'), nullable=False)
    schedule_id = Column(Integer, ForeignKey('branch_service_schedules.id'))
    customer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    staff_id = Column(Integer, ForeignKey('users.id'))
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(String(20), default='scheduled')  # scheduled, confirmed, completed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship('BranchService', back_populates='appointments')
    schedule = relationship('BranchServiceSchedule', back_populates='appointments')
    customer = relationship('User', foreign_keys=[customer_id], backref='service_appointments')
    staff = relationship('User', foreign_keys=[staff_id], backref='staff_appointments')

    def to_dict(self):
        return {
            'id': self.id,
            'service_id': self.service_id,
            'service_name': self.service.name,
            'branch_name': self.service.branch.name,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name,
            'staff_id': self.staff_id,
            'staff_name': self.staff.name if self.staff else None,
            'appointment_date': self.appointment_date.isoformat(),
            'appointment_time': self.appointment_time.strftime('%H:%M'),
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchServiceAppointment {self.service.name} - {self.customer.name}>' 
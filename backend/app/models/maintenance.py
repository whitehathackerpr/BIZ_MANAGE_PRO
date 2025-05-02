from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Float, JSON
from sqlalchemy.orm import relationship
from ..extensions import Base

class BranchMaintenance(Base):
    __tablename__ = 'branch_maintenance'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    maintenance_type = Column(String(50), nullable=False)  # preventive, corrective, emergency
    priority = Column(String(20), default='medium')  # low, medium, high, urgent
    status = Column(String(20), default='pending')  # pending, scheduled, in_progress, completed
    scheduled_date = Column(DateTime)
    completed_date = Column(DateTime)
    assigned_to = Column(Integer, ForeignKey('users.id'))
    cost = Column(Float)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    branch = relationship('Branch', backref='maintenance')
    schedules = relationship('BranchMaintenanceSchedule', back_populates='maintenance')
    assignee = relationship('User', foreign_keys=[assigned_to], backref='assigned_maintenance')
    creator = relationship('User', foreign_keys=[created_by], backref='created_maintenance')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'title': self.title,
            'description': self.description,
            'maintenance_type': self.maintenance_type,
            'priority': self.priority,
            'status': self.status,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'assigned_to': self.assigned_to,
            'assignee_name': self.assignee.name if self.assignee else None,
            'cost': self.cost,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchMaintenance {self.branch.name} - {self.title}>'

class BranchMaintenanceSchedule(Base):
    __tablename__ = 'branch_maintenance_schedules'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    maintenance_id = Column(Integer, ForeignKey('branch_maintenance.id'))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    frequency = Column(String(50), nullable=False)  # daily, weekly, monthly, quarterly, yearly
    last_performed = Column(DateTime)
    next_due = Column(DateTime)
    assigned_to = Column(Integer, ForeignKey('users.id'))
    checklist = Column(JSON, nullable=False)  # List of maintenance tasks
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    branch = relationship('Branch', backref='maintenance_schedules')
    assignee = relationship('User', foreign_keys=[assigned_to], backref='assigned_schedules')
    creator = relationship('User', foreign_keys=[created_by], backref='created_schedules')
    maintenance = relationship('BranchMaintenance', back_populates='schedules')
    records = relationship('BranchMaintenanceRecord', back_populates='schedule')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'title': self.title,
            'description': self.description,
            'frequency': self.frequency,
            'last_performed': self.last_performed.isoformat() if self.last_performed else None,
            'next_due': self.next_due.isoformat() if self.next_due else None,
            'assigned_to': self.assigned_to,
            'assignee_name': self.assignee.name if self.assignee else None,
            'checklist': self.checklist,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchMaintenanceSchedule {self.branch.name} - {self.title}>'

class BranchMaintenanceRecord(Base):
    __tablename__ = 'branch_maintenance_records'

    id = Column(Integer, primary_key=True)
    maintenance_id = Column(Integer, ForeignKey('branch_maintenance.id'), nullable=False)
    schedule_id = Column(Integer, ForeignKey('branch_maintenance_schedules.id'))
    performed_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    performed_at = Column(DateTime, nullable=False)
    duration = Column(Integer)  # Duration in minutes
    materials_used = Column(JSON)  # List of materials used
    cost = Column(Float)
    notes = Column(Text)
    photos = Column(JSON)  # List of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    maintenance = relationship('BranchMaintenance', backref='records')
    schedule = relationship('BranchMaintenanceSchedule', back_populates='records')
    performer = relationship('User', backref='maintenance_records')

    def to_dict(self):
        return {
            'id': self.id,
            'maintenance_id': self.maintenance_id,
            'maintenance_title': self.maintenance.title,
            'branch_name': self.maintenance.branch.name,
            'schedule_id': self.schedule_id,
            'schedule_title': self.schedule.title if self.schedule else None,
            'performed_by': self.performed_by,
            'performer_name': self.performer.name,
            'performed_at': self.performed_at.isoformat(),
            'duration': self.duration,
            'materials_used': self.materials_used,
            'cost': self.cost,
            'notes': self.notes,
            'photos': self.photos,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchMaintenanceRecord {self.maintenance.title} - {self.performed_at}>' 
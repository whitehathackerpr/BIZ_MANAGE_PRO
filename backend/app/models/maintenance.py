from app import db
from datetime import datetime

class BranchMaintenance(db.Model):
    __tablename__ = 'branch_maintenance'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    maintenance_type = db.Column(db.String(50), nullable=False)  # preventive, corrective, emergency
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='pending')  # pending, scheduled, in_progress, completed
    scheduled_date = db.Column(db.DateTime)
    completed_date = db.Column(db.DateTime)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    cost = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='maintenance_tasks')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_maintenance')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_maintenance')

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

class BranchMaintenanceSchedule(db.Model):
    __tablename__ = 'branch_maintenance_schedules'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    frequency = db.Column(db.String(50), nullable=False)  # daily, weekly, monthly, quarterly, yearly
    last_performed = db.Column(db.DateTime)
    next_due = db.Column(db.DateTime)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    checklist = db.Column(db.JSON, nullable=False)  # List of maintenance tasks
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='maintenance_schedules')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_schedules')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_schedules')

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

class BranchMaintenanceRecord(db.Model):
    __tablename__ = 'branch_maintenance_records'

    id = db.Column(db.Integer, primary_key=True)
    maintenance_id = db.Column(db.Integer, db.ForeignKey('branch_maintenance.id'), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('branch_maintenance_schedules.id'))
    performed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    performed_at = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer)  # Duration in minutes
    materials_used = db.Column(db.JSON)  # List of materials used
    cost = db.Column(db.Float)
    notes = db.Column(db.Text)
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    maintenance = db.relationship('BranchMaintenance', backref='records')
    schedule = db.relationship('BranchMaintenanceSchedule', backref='records')
    performer = db.relationship('User', backref='maintenance_records')

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
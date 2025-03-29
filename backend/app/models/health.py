from app import db
from datetime import datetime

class BranchHealth(db.Model):
    __tablename__ = 'branch_health'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    health_type = db.Column(db.String(50), nullable=False)  # safety, hygiene, emergency, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, maintenance
    last_inspection = db.Column(db.DateTime)
    next_inspection = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='health_systems')
    creator = db.relationship('User', backref='created_health')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'health_type': self.health_type,
            'status': self.status,
            'last_inspection': self.last_inspection.isoformat() if self.last_inspection else None,
            'next_inspection': self.next_inspection.isoformat() if self.next_inspection else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchHealth {self.branch.name} - {self.health_type}>'

class BranchHealthInspection(db.Model):
    __tablename__ = 'branch_health_inspections'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    health_id = db.Column(db.Integer, db.ForeignKey('branch_health.id'), nullable=False)
    inspector_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    inspection_date = db.Column(db.DateTime, nullable=False)
    inspection_type = db.Column(db.String(50), nullable=False)  # routine, special, emergency
    findings = db.Column(db.JSON, nullable=False)  # List of inspection findings
    recommendations = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='health_inspections')
    health = db.relationship('BranchHealth', backref='inspections')
    inspector = db.relationship('User', backref='conducted_inspections')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'health_id': self.health_id,
            'health_type': self.health.health_type,
            'inspector_id': self.inspector_id,
            'inspector_name': self.inspector.name,
            'inspection_date': self.inspection_date.isoformat(),
            'inspection_type': self.inspection_type,
            'findings': self.findings,
            'recommendations': self.recommendations,
            'status': self.status,
            'photos': self.photos,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchHealthInspection {self.branch.name} - {self.inspection_date}>'

class BranchHealthIncident(db.Model):
    __tablename__ = 'branch_health_incidents'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    incident_type = db.Column(db.String(50), nullable=False)  # injury, illness, accident, etc.
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, nullable=False)
    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    affected_people = db.Column(db.JSON)  # List of affected people
    immediate_actions = db.Column(db.Text)
    status = db.Column(db.String(20), default='open')  # open, investigating, resolved
    resolution = db.Column(db.Text)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    resolved_at = db.Column(db.DateTime)
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='health_incidents')
    reporter = db.relationship('User', foreign_keys=[reported_by], backref='reported_health_incidents')
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref='resolved_health_incidents')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'incident_type': self.incident_type,
            'severity': self.severity,
            'description': self.description,
            'location': self.location,
            'timestamp': self.timestamp.isoformat(),
            'reported_by': self.reported_by,
            'reporter_name': self.reporter.name,
            'affected_people': self.affected_people,
            'immediate_actions': self.immediate_actions,
            'status': self.status,
            'resolution': self.resolution,
            'resolved_by': self.resolved_by,
            'resolver_name': self.resolver.name if self.resolver else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'photos': self.photos,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchHealthIncident {self.branch.name} - {self.incident_type}>' 
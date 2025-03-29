from app import db
from datetime import datetime

class BranchEnvironment(db.Model):
    __tablename__ = 'branch_environment'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    environment_type = db.Column(db.String(50), nullable=False)  # energy, waste, water, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, maintenance
    last_audit = db.Column(db.DateTime)
    next_audit = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='environment_systems')
    creator = db.relationship('User', backref='created_environment')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'environment_type': self.environment_type,
            'status': self.status,
            'last_audit': self.last_audit.isoformat() if self.last_audit else None,
            'next_audit': self.next_audit.isoformat() if self.next_audit else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchEnvironment {self.branch.name} - {self.environment_type}>'

class BranchEnvironmentalAudit(db.Model):
    __tablename__ = 'branch_environmental_audits'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    environment_id = db.Column(db.Integer, db.ForeignKey('branch_environment.id'), nullable=False)
    auditor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    audit_date = db.Column(db.DateTime, nullable=False)
    audit_type = db.Column(db.String(50), nullable=False)  # routine, special, compliance
    findings = db.Column(db.JSON, nullable=False)  # List of audit findings
    recommendations = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='environmental_audits')
    environment = db.relationship('BranchEnvironment', backref='audits')
    auditor = db.relationship('User', backref='conducted_audits')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'environment_id': self.environment_id,
            'environment_type': self.environment.environment_type,
            'auditor_id': self.auditor_id,
            'auditor_name': self.auditor.name,
            'audit_date': self.audit_date.isoformat(),
            'audit_type': self.audit_type,
            'findings': self.findings,
            'recommendations': self.recommendations,
            'status': self.status,
            'photos': self.photos,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchEnvironmentalAudit {self.branch.name} - {self.audit_date}>'

class BranchEnvironmentalMetric(db.Model):
    __tablename__ = 'branch_environmental_metrics'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    environment_id = db.Column(db.Integer, db.ForeignKey('branch_environment.id'), nullable=False)
    metric_type = db.Column(db.String(50), nullable=False)  # energy_consumption, water_usage, waste_generation, etc.
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    recorded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='environmental_metrics')
    environment = db.relationship('BranchEnvironment', backref='metrics')
    recorder = db.relationship('User', backref='recorded_metrics')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'environment_id': self.environment_id,
            'environment_type': self.environment.environment_type,
            'metric_type': self.metric_type,
            'value': self.value,
            'unit': self.unit,
            'timestamp': self.timestamp.isoformat(),
            'recorded_by': self.recorded_by,
            'recorder_name': self.recorder.name,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchEnvironmentalMetric {self.branch.name} - {self.metric_type}>' 
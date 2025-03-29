from app import db
from datetime import datetime

class BranchCompliance(db.Model):
    __tablename__ = 'branch_compliance'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    compliance_type = db.Column(db.String(50), nullable=False)  # regulatory, safety, quality, etc.
    requirements = db.Column(db.JSON, nullable=False)  # List of compliance requirements
    status = db.Column(db.String(20), default='pending')  # pending, compliant, non_compliant
    due_date = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='compliance_requirements')
    creator = db.relationship('User', backref='created_compliance')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'title': self.title,
            'description': self.description,
            'compliance_type': self.compliance_type,
            'requirements': self.requirements,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchCompliance {self.branch.name} - {self.title}>'

class BranchComplianceCheck(db.Model):
    __tablename__ = 'branch_compliance_checks'

    id = db.Column(db.Integer, primary_key=True)
    compliance_id = db.Column(db.Integer, db.ForeignKey('branch_compliance.id'), nullable=False)
    requirement_id = db.Column(db.String(100), nullable=False)  # Reference to specific requirement
    status = db.Column(db.String(20), default='pending')  # pending, compliant, non_compliant
    notes = db.Column(db.Text)
    checked_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    checked_at = db.Column(db.DateTime)
    evidence = db.Column(db.JSON)  # Links to supporting documents
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    compliance = db.relationship('BranchCompliance', backref='checks')
    checker = db.relationship('User', backref='compliance_checks')

    def to_dict(self):
        return {
            'id': self.id,
            'compliance_id': self.compliance_id,
            'compliance_title': self.compliance.title,
            'branch_name': self.compliance.branch.name,
            'requirement_id': self.requirement_id,
            'status': self.status,
            'notes': self.notes,
            'checked_by': self.checked_by,
            'checker_name': self.checker.name if self.checker else None,
            'checked_at': self.checked_at.isoformat() if self.checked_at else None,
            'evidence': self.evidence,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchComplianceCheck {self.compliance.title} - {self.requirement_id}>'

class BranchComplianceViolation(db.Model):
    __tablename__ = 'branch_compliance_violations'

    id = db.Column(db.Integer, primary_key=True)
    compliance_id = db.Column(db.Integer, db.ForeignKey('branch_compliance.id'), nullable=False)
    check_id = db.Column(db.Integer, db.ForeignKey('branch_compliance_checks.id'))
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    status = db.Column(db.String(20), default='open')  # open, in_progress, resolved
    resolution = db.Column(db.Text)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    resolved_at = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    compliance = db.relationship('BranchCompliance', backref='violations')
    check = db.relationship('BranchComplianceCheck', backref='violations')
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref='resolved_violations')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_violations')

    def to_dict(self):
        return {
            'id': self.id,
            'compliance_id': self.compliance_id,
            'compliance_title': self.compliance.title,
            'branch_name': self.compliance.branch.name,
            'check_id': self.check_id,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'resolution': self.resolution,
            'resolved_by': self.resolved_by,
            'resolver_name': self.resolver.name if self.resolver else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchComplianceViolation {self.compliance.title} - {self.severity}>'

 
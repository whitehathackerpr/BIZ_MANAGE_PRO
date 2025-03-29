from app import db
from datetime import datetime

class BranchRisk(db.Model):
    __tablename__ = 'branch_risks'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    risk_type = db.Column(db.String(50), nullable=False)  # operational, financial, strategic, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, mitigated
    last_assessment = db.Column(db.DateTime)
    next_assessment = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='risk_systems')
    creator = db.relationship('User', backref='created_risks')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'risk_type': self.risk_type,
            'status': self.status,
            'last_assessment': self.last_assessment.isoformat() if self.last_assessment else None,
            'next_assessment': self.next_assessment.isoformat() if self.next_assessment else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchRisk {self.branch.name} - {self.risk_type}>'

class BranchRiskAssessment(db.Model):
    __tablename__ = 'branch_risk_assessments'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    risk_id = db.Column(db.Integer, db.ForeignKey('branch_risks.id'), nullable=False)
    assessor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assessment_date = db.Column(db.DateTime, nullable=False)
    assessment_type = db.Column(db.String(50), nullable=False)  # routine, special, compliance
    findings = db.Column(db.JSON, nullable=False)  # List of assessment findings
    recommendations = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='risk_assessments')
    risk = db.relationship('BranchRisk', backref='assessments')
    assessor = db.relationship('User', backref='conducted_assessments')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'risk_id': self.risk_id,
            'risk_type': self.risk.risk_type,
            'assessor_id': self.assessor_id,
            'assessor_name': self.assessor.name,
            'assessment_date': self.assessment_date.isoformat(),
            'assessment_type': self.assessment_type,
            'findings': self.findings,
            'recommendations': self.recommendations,
            'status': self.status,
            'photos': self.photos,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchRiskAssessment {self.branch.name} - {self.assessment_date}>'

class BranchRiskMitigation(db.Model):
    __tablename__ = 'branch_risk_mitigations'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    risk_id = db.Column(db.Integer, db.ForeignKey('branch_risks.id'), nullable=False)
    mitigation_type = db.Column(db.String(50), nullable=False)  # control, transfer, avoid, accept
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    cost = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='risk_mitigations')
    risk = db.relationship('BranchRisk', backref='mitigations')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_mitigations')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_mitigations')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'risk_id': self.risk_id,
            'risk_type': self.risk.risk_type,
            'mitigation_type': self.mitigation_type,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
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
        return f'<BranchRiskMitigation {self.branch.name} - {self.mitigation_type}>' 
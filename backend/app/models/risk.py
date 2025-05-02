from ..extensions import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

class BranchRisk(Base):
    __tablename__ = 'branch_risks'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    risk_type = Column(String(50), nullable=False)  # operational, financial, strategic, etc.
    status = Column(String(20), default='active')  # active, inactive, mitigated
    last_assessment = Column(DateTime)
    next_assessment = Column(DateTime)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='risk_systems')
    creator = relationship('User', backref='created_risks')

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

class BranchRiskAssessment(Base):
    __tablename__ = 'branch_risk_assessments'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    risk_id = Column(Integer, ForeignKey('branch_risks.id'), nullable=False)
    assessor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    assessment_date = Column(DateTime, nullable=False)
    assessment_type = Column(String(50), nullable=False)  # routine, special, compliance
    findings = Column(JSON, nullable=False)  # List of assessment findings
    recommendations = Column(Text)
    status = Column(String(20), default='pending')  # pending, completed, failed
    photos = Column(JSON)  # List of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='risk_assessments')
    risk = relationship('BranchRisk', backref='assessments')
    assessor = relationship('User', backref='conducted_assessments')

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

class BranchRiskMitigation(Base):
    __tablename__ = 'branch_risk_mitigations'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    risk_id = Column(Integer, ForeignKey('branch_risks.id'), nullable=False)
    mitigation_type = Column(String(50), nullable=False)  # control, transfer, avoid, accept
    description = Column(Text, nullable=False)
    priority = Column(String(20), default='medium')  # low, medium, high, urgent
    status = Column(String(20), default='pending')  # pending, in_progress, completed
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    assigned_to = Column(Integer, ForeignKey('users.id'))
    cost = Column(Float)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='risk_mitigations')
    risk = relationship('BranchRisk', backref='mitigations')
    assignee = relationship('User', foreign_keys=[assigned_to], backref='assigned_mitigations')
    creator = relationship('User', foreign_keys=[created_by], backref='created_mitigations')

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
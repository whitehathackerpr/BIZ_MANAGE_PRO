from ..extensions import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

class BranchQuality(Base):
    __tablename__ = 'branch_quality'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    quality_type = Column(String(50), nullable=False)  # product, service, process, etc.
    status = Column(String(20), default='active')  # active, inactive, maintenance
    last_review = Column(DateTime)
    next_review = Column(DateTime)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='quality_systems')
    creator = relationship('User', backref='created_quality')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'quality_type': self.quality_type,
            'status': self.status,
            'last_review': self.last_review.isoformat() if self.last_review else None,
            'next_review': self.next_review.isoformat() if self.next_review else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchQuality {self.branch.name} - {self.quality_type}>'

class BranchQualityReview(Base):
    __tablename__ = 'branch_quality_reviews'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    quality_id = Column(Integer, ForeignKey('branch_quality.id'), nullable=False)
    reviewer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    review_date = Column(DateTime, nullable=False)
    review_type = Column(String(50), nullable=False)  # routine, special, compliance
    findings = Column(JSON, nullable=False)  # List of review findings
    recommendations = Column(Text)
    status = Column(String(20), default='pending')  # pending, completed, failed
    photos = Column(JSON)  # List of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='quality_reviews')
    quality = relationship('BranchQuality', backref='reviews')
    reviewer = relationship('User', backref='conducted_reviews')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'quality_id': self.quality_id,
            'quality_type': self.quality.quality_type,
            'reviewer_id': self.reviewer_id,
            'reviewer_name': self.reviewer.name,
            'review_date': self.review_date.isoformat(),
            'review_type': self.review_type,
            'findings': self.findings,
            'recommendations': self.recommendations,
            'status': self.status,
            'photos': self.photos,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchQualityReview {self.branch.name} - {self.review_date}>'

class BranchQualityIssue(Base):
    __tablename__ = 'branch_quality_issues'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    issue_type = Column(String(50), nullable=False)  # defect, non_conformance, complaint, etc.
    severity = Column(String(20), default='medium')  # low, medium, high, critical
    description = Column(Text, nullable=False)
    location = Column(String(200))
    timestamp = Column(DateTime, nullable=False)
    reported_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    affected_items = Column(JSON)  # List of affected items
    immediate_actions = Column(Text)
    status = Column(String(20), default='open')  # open, investigating, resolved
    resolution = Column(Text)
    resolved_by = Column(Integer, ForeignKey('users.id'))
    resolved_at = Column(DateTime)
    photos = Column(JSON)  # List of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='quality_issues')
    reporter = relationship('User', foreign_keys=[reported_by], backref='reported_quality_issues')
    resolver = relationship('User', foreign_keys=[resolved_by], backref='resolved_quality_issues')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'issue_type': self.issue_type,
            'severity': self.severity,
            'description': self.description,
            'location': self.location,
            'timestamp': self.timestamp.isoformat(),
            'reported_by': self.reported_by,
            'reporter_name': self.reporter.name,
            'affected_items': self.affected_items,
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
        return f'<BranchQualityIssue {self.branch.name} - {self.issue_type}>' 
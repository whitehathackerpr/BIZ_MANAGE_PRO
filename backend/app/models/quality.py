from app import db
from datetime import datetime

class BranchQuality(db.Model):
    __tablename__ = 'branch_quality'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    quality_type = db.Column(db.String(50), nullable=False)  # product, service, process, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, maintenance
    last_review = db.Column(db.DateTime)
    next_review = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='quality_systems')
    creator = db.relationship('User', backref='created_quality')

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

class BranchQualityReview(db.Model):
    __tablename__ = 'branch_quality_reviews'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    quality_id = db.Column(db.Integer, db.ForeignKey('branch_quality.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    review_date = db.Column(db.DateTime, nullable=False)
    review_type = db.Column(db.String(50), nullable=False)  # routine, special, compliance
    findings = db.Column(db.JSON, nullable=False)  # List of review findings
    recommendations = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='quality_reviews')
    quality = db.relationship('BranchQuality', backref='reviews')
    reviewer = db.relationship('User', backref='conducted_reviews')

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

class BranchQualityIssue(db.Model):
    __tablename__ = 'branch_quality_issues'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    issue_type = db.Column(db.String(50), nullable=False)  # defect, non_conformance, complaint, etc.
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, nullable=False)
    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    affected_items = db.Column(db.JSON)  # List of affected items
    immediate_actions = db.Column(db.Text)
    status = db.Column(db.String(20), default='open')  # open, investigating, resolved
    resolution = db.Column(db.Text)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    resolved_at = db.Column(db.DateTime)
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='quality_issues')
    reporter = db.relationship('User', foreign_keys=[reported_by], backref='reported_quality_issues')
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref='resolved_quality_issues')

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
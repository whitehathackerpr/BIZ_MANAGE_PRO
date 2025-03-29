from app import db
from datetime import datetime

class BranchSecurity(db.Model):
    __tablename__ = 'branch_security'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    security_type = db.Column(db.String(50), nullable=False)  # access_control, surveillance, alarm, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, maintenance
    last_checked = db.Column(db.DateTime)
    next_check = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='security_systems')
    creator = db.relationship('User', backref='created_security')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'security_type': self.security_type,
            'status': self.status,
            'last_checked': self.last_checked.isoformat() if self.last_checked else None,
            'next_check': self.next_check.isoformat() if self.next_check else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchSecurity {self.branch.name} - {self.security_type}>'

class BranchAccessLog(db.Model):
    __tablename__ = 'branch_access_logs'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    access_type = db.Column(db.String(20), nullable=False)  # entry, exit
    access_point = db.Column(db.String(100))  # door, gate, etc.
    access_method = db.Column(db.String(50))  # key, card, biometric, etc.
    timestamp = db.Column(db.DateTime, nullable=False)
    ip_address = db.Column(db.String(45))  # IPv6 compatible
    device_info = db.Column(db.String(200))
    status = db.Column(db.String(20), default='success')  # success, failed
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='access_logs')
    user = db.relationship('User', backref='access_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'access_type': self.access_type,
            'access_point': self.access_point,
            'access_method': self.access_method,
            'timestamp': self.timestamp.isoformat(),
            'ip_address': self.ip_address,
            'device_info': self.device_info,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchAccessLog {self.branch.name} - {self.user.name} - {self.timestamp}>'

class BranchSecurityIncident(db.Model):
    __tablename__ = 'branch_security_incidents'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    incident_type = db.Column(db.String(50), nullable=False)  # theft, vandalism, unauthorized_access, etc.
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, nullable=False)
    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='open')  # open, investigating, resolved
    resolution = db.Column(db.Text)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    resolved_at = db.Column(db.DateTime)
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='security_incidents')
    reporter = db.relationship('User', foreign_keys=[reported_by], backref='reported_incidents')
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref='resolved_incidents')

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
        return f'<BranchSecurityIncident {self.branch.name} - {self.incident_type}>' 
from ..extensions import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

class BranchSecurity(Base):
    __tablename__ = 'branch_security'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    security_type = Column(String(50), nullable=False)  # access_control, surveillance, alarm, etc.
    status = Column(String(20), default='active')  # active, inactive, maintenance
    last_checked = Column(DateTime)
    next_check = Column(DateTime)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='security_systems')
    creator = relationship('User', backref='created_security')

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

class BranchAccessLog(Base):
    __tablename__ = 'branch_access_logs'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    access_type = Column(String(20), nullable=False)  # entry, exit
    access_point = Column(String(100))  # door, gate, etc.
    access_method = Column(String(50))  # key, card, biometric, etc.
    timestamp = Column(DateTime, nullable=False)
    ip_address = Column(String(45))  # IPv6 compatible
    device_info = Column(String(200))
    status = Column(String(20), default='success')  # success, failed
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='access_logs')
    user = relationship('User', backref='access_logs')

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

class BranchSecurityIncident(Base):
    __tablename__ = 'branch_security_incidents'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    incident_type = Column(String(50), nullable=False)  # theft, vandalism, unauthorized_access, etc.
    severity = Column(String(20), default='medium')  # low, medium, high, critical
    description = Column(Text, nullable=False)
    location = Column(String(200))
    timestamp = Column(DateTime, nullable=False)
    reported_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='open')  # open, investigating, resolved
    resolution = Column(Text)
    resolved_by = Column(Integer, ForeignKey('users.id'))
    resolved_at = Column(DateTime)
    photos = Column(JSON)  # List of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='security_incidents')
    reporter = relationship('User', foreign_keys=[reported_by], backref='reported_incidents')
    resolver = relationship('User', foreign_keys=[resolved_by], backref='resolved_incidents')

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
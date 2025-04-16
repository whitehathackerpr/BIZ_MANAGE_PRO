from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class IntegrationProvider(Base):
    __tablename__ = 'integration_providers'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    description = Column(Text)
    config_schema = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    instances = relationship('IntegrationInstance', backref='provider', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'config_schema': self.config_schema,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<IntegrationProvider {self.name}>'

class IntegrationInstance(Base):
    __tablename__ = 'integration_instances'
    
    id = Column(Integer, primary_key=True)
    provider_id = Column(Integer, ForeignKey('integration_providers.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    config = Column(JSON)
    credentials = Column(JSON)
    status = Column(String(50), default='inactive')  # active, inactive, error
    error_message = Column(Text)
    last_sync_at = Column(DateTime)
    sync_frequency = Column(String(50))  # daily, weekly, monthly, custom
    next_sync_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'name': self.name,
            'description': self.description,
            'config': self.config,
            'status': self.status,
            'error_message': self.error_message,
            'last_sync_at': self.last_sync_at.isoformat() if self.last_sync_at else None,
            'sync_frequency': self.sync_frequency,
            'next_sync_at': self.next_sync_at.isoformat() if self.next_sync_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'provider': self.provider.to_dict() if self.provider else None
        }
    
    def __repr__(self):
        return f'<IntegrationInstance {self.name}>'

class IntegrationLog(Base):
    __tablename__ = 'integration_logs'
    
    id = Column(Integer, primary_key=True)
    instance_id = Column(Integer, ForeignKey('integration_instances.id'), nullable=False)
    event_type = Column(String(50), nullable=False)  # sync, error, config_change
    status = Column(String(50), nullable=False)  # success, failure, warning
    message = Column(Text)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    instance = relationship('IntegrationInstance', backref='logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'instance_id': self.instance_id,
            'event_type': self.event_type,
            'status': self.status,
            'message': self.message,
            'details': self.details,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<IntegrationLog {self.event_type} {self.status}>'

class BranchIntegration(Base):
    __tablename__ = 'branch_integrations'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    integration_type = Column(String(50), nullable=False)  # payment, shipping, accounting, etc.
    status = Column(String(20), default='active')  # active, inactive, error
    last_sync = Column(DateTime)
    next_sync = Column(DateTime)
    config = Column(JSON)  # Integration configuration
    credentials = Column(JSON)  # Encrypted credentials
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='integrations')
    creator = relationship('User', backref='created_integrations')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'integration_type': self.integration_type,
            'status': self.status,
            'last_sync': self.last_sync.isoformat() if self.last_sync else None,
            'next_sync': self.next_sync.isoformat() if self.next_sync else None,
            'config': self.config,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchIntegration {self.branch.name} - {self.integration_type}>'

class BranchIntegrationLog(Base):
    __tablename__ = 'branch_integration_logs'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    integration_id = Column(Integer, ForeignKey('branch_integrations.id'), nullable=False)
    operation = Column(String(50), nullable=False)  # sync, push, pull, etc.
    status = Column(String(20), default='pending')  # pending, success, error
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    data = Column(JSON)  # Operation data
    error = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='integration_logs')
    integration = relationship('BranchIntegration', backref='logs')
    creator = relationship('User', backref='created_integration_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'integration_id': self.integration_id,
            'integration_type': self.integration.integration_type,
            'operation': self.operation,
            'status': self.status,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'data': self.data,
            'error': self.error,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchIntegrationLog {self.branch.name} - {self.operation}>'

class BranchIntegrationMapping(Base):
    __tablename__ = 'branch_integration_mappings'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    integration_id = Column(Integer, ForeignKey('branch_integrations.id'), nullable=False)
    source_type = Column(String(50), nullable=False)  # internal, external
    source_field = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)  # internal, external
    target_field = Column(String(100), nullable=False)
    transformation = Column(JSON)  # Field transformation rules
    status = Column(String(20), default='active')  # active, inactive
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='integration_mappings')
    integration = relationship('BranchIntegration', backref='mappings')
    creator = relationship('User', backref='created_integration_mappings')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'integration_id': self.integration_id,
            'integration_type': self.integration.integration_type,
            'source_type': self.source_type,
            'source_field': self.source_field,
            'target_type': self.target_type,
            'target_field': self.target_field,
            'transformation': self.transformation,
            'status': self.status,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchIntegrationMapping {self.branch.name} - {self.source_field} -> {self.target_field}>' 
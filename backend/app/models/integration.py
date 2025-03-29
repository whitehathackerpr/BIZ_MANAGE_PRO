from datetime import datetime
from ..extensions import db

class IntegrationProvider(db.Model):
    __tablename__ = 'integration_providers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    config_schema = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    instances = db.relationship('IntegrationInstance', backref='provider', lazy='dynamic')
    
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

class IntegrationInstance(db.Model):
    __tablename__ = 'integration_instances'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('integration_providers.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    config = db.Column(db.JSON)
    credentials = db.Column(db.JSON)
    status = db.Column(db.String(50), default='inactive')  # active, inactive, error
    error_message = db.Column(db.Text)
    last_sync_at = db.Column(db.DateTime)
    sync_frequency = db.Column(db.String(50))  # daily, weekly, monthly, custom
    next_sync_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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

class IntegrationLog(db.Model):
    __tablename__ = 'integration_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    instance_id = db.Column(db.Integer, db.ForeignKey('integration_instances.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  # sync, error, config_change
    status = db.Column(db.String(50), nullable=False)  # success, failure, warning
    message = db.Column(db.Text)
    details = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    instance = db.relationship('IntegrationInstance', backref='logs')
    
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

class BranchIntegration(db.Model):
    __tablename__ = 'branch_integrations'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    integration_type = db.Column(db.String(50), nullable=False)  # payment, shipping, accounting, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, error
    last_sync = db.Column(db.DateTime)
    next_sync = db.Column(db.DateTime)
    config = db.Column(db.JSON)  # Integration configuration
    credentials = db.Column(db.JSON)  # Encrypted credentials
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='integrations')
    creator = db.relationship('User', backref='created_integrations')

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

class BranchIntegrationLog(db.Model):
    __tablename__ = 'branch_integration_logs'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    integration_id = db.Column(db.Integer, db.ForeignKey('branch_integrations.id'), nullable=False)
    operation = db.Column(db.String(50), nullable=False)  # sync, push, pull, etc.
    status = db.Column(db.String(20), default='pending')  # pending, success, error
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    data = db.Column(db.JSON)  # Operation data
    error = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='integration_logs')
    integration = db.relationship('BranchIntegration', backref='logs')
    creator = db.relationship('User', backref='created_integration_logs')

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

class BranchIntegrationMapping(db.Model):
    __tablename__ = 'branch_integration_mappings'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    integration_id = db.Column(db.Integer, db.ForeignKey('branch_integrations.id'), nullable=False)
    source_type = db.Column(db.String(50), nullable=False)  # internal, external
    source_field = db.Column(db.String(100), nullable=False)
    target_type = db.Column(db.String(50), nullable=False)  # internal, external
    target_field = db.Column(db.String(100), nullable=False)
    transformation = db.Column(db.JSON)  # Field transformation rules
    status = db.Column(db.String(20), default='active')  # active, inactive
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='integration_mappings')
    integration = db.relationship('BranchIntegration', backref='mappings')
    creator = db.relationship('User', backref='created_integration_mappings')

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
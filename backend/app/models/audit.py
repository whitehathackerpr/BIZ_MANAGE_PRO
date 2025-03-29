from app import db
from datetime import datetime

class BranchAudit(db.Model):
    __tablename__ = 'branch_audits'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)  # create, update, delete, etc.
    entity_type = db.Column(db.String(50), nullable=False)  # inventory, sales, users, etc.
    entity_id = db.Column(db.Integer)  # ID of the affected entity
    old_values = db.Column(db.JSON)  # Previous state of the entity
    new_values = db.Column(db.JSON)  # New state of the entity
    ip_address = db.Column(db.String(45))  # IPv4 or IPv6 address
    user_agent = db.Column(db.String(200))  # Browser/device information
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='audits')
    user = db.relationship('User', backref='audit_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'old_values': self.old_values,
            'new_values': self.new_values,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchAudit {self.branch.name} - {self.action} {self.entity_type}>'

class BranchAuditConfig(db.Model):
    __tablename__ = 'branch_audit_configs'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)
    enabled = db.Column(db.Boolean, default=True)
    retention_days = db.Column(db.Integer, default=90)  # Number of days to retain audit logs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='audit_configs')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'entity_type': self.entity_type,
            'enabled': self.enabled,
            'retention_days': self.retention_days,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchAuditConfig {self.branch.name} - {self.entity_type}>'

class BranchAuditExport(db.Model):
    __tablename__ = 'branch_audit_exports'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    entity_types = db.Column(db.JSON, nullable=False)  # List of entity types to export
    format = db.Column(db.String(20), default='csv')  # csv, excel, pdf
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    file_path = db.Column(db.String(255))  # Path to the exported file
    error_message = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='audit_exports')
    creator = db.relationship('User', backref='created_audit_exports')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'entity_types': self.entity_types,
            'format': self.format,
            'status': self.status,
            'file_path': self.file_path,
            'error_message': self.error_message,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchAuditExport {self.branch.name} - {self.start_date} to {self.end_date}>' 
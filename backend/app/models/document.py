from app import db
from datetime import datetime

class BranchDocument(db.Model):
    __tablename__ = 'branch_documents'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)  # policy, procedure, form, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, archived
    last_review = db.Column(db.DateTime)
    next_review = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='document_systems')
    creator = db.relationship('User', backref='created_documents')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'document_type': self.document_type,
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
        return f'<BranchDocument {self.branch.name} - {self.document_type}>'

class BranchDocumentFile(db.Model):
    __tablename__ = 'branch_document_files'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    document_id = db.Column(db.Integer, db.ForeignKey('branch_documents.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_type = db.Column(db.String(50), nullable=False)  # pdf, doc, xls, etc.
    file_url = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)  # Size in bytes
    version = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, inactive, archived
    access_level = db.Column(db.String(20), default='public')  # public, private, restricted
    tags = db.Column(db.JSON)  # List of tags
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='document_files')
    document = db.relationship('BranchDocument', backref='files')
    creator = db.relationship('User', backref='created_files')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'document_id': self.document_id,
            'document_type': self.document.document_type,
            'title': self.title,
            'description': self.description,
            'file_type': self.file_type,
            'file_url': self.file_url,
            'file_size': self.file_size,
            'version': self.version,
            'status': self.status,
            'access_level': self.access_level,
            'tags': self.tags,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchDocumentFile {self.branch.name} - {self.title}>'

class BranchDocumentAccess(db.Model):
    __tablename__ = 'branch_document_access'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey('branch_document_files.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    access_type = db.Column(db.String(20), default='view')  # view, edit, admin
    granted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    granted_at = db.Column(db.DateTime, nullable=False)
    expires_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='document_access')
    file = db.relationship('BranchDocumentFile', backref='access')
    user = db.relationship('User', foreign_keys=[user_id], backref='document_access')
    granter = db.relationship('User', foreign_keys=[granted_by], backref='granted_access')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'file_id': self.file_id,
            'file_title': self.file.title,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'access_type': self.access_type,
            'granted_by': self.granted_by,
            'granter_name': self.granter.name,
            'granted_at': self.granted_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchDocumentAccess {self.branch.name} - {self.user.name}>' 
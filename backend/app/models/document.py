from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..extensions import Base

class BranchDocument(Base):
    __tablename__ = 'branch_documents'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    files = relationship('BranchDocumentFile', back_populates='document')
    accesses = relationship('BranchDocumentAccess', back_populates='document')
    def __repr__(self):
        return f'<BranchDocument {self.title}>'

class BranchDocumentFile(Base):
    __tablename__ = 'branch_document_files'
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('branch_documents.id'), nullable=False)
    file_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    document = relationship('BranchDocument', back_populates='files')
    def __repr__(self):
        return f'<BranchDocumentFile {self.file_path}>'

class BranchDocumentAccess(Base):
    __tablename__ = 'branch_document_accesses'
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('branch_documents.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    accessed_at = Column(DateTime, default=datetime.utcnow)
    document = relationship('BranchDocument', back_populates='accesses')
    user = relationship('User', backref='document_accesses')
    def __repr__(self):
        return f'<BranchDocumentAccess {self.id}>' 
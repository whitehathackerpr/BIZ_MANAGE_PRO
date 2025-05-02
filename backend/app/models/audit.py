from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..extensions import Base

class BranchAudit(Base):
    __tablename__ = 'branch_audits'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    configs = relationship('BranchAuditConfig', back_populates='audit')
    exports = relationship('BranchAuditExport', back_populates='audit')
    def __repr__(self):
        return f'<BranchAudit {self.id}>'

class BranchAuditConfig(Base):
    __tablename__ = 'branch_audit_configs'
    id = Column(Integer, primary_key=True)
    audit_id = Column(Integer, ForeignKey('branch_audits.id'), nullable=False)
    config = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    audit = relationship('BranchAudit', back_populates='configs')
    def __repr__(self):
        return f'<BranchAuditConfig {self.id}>'

class BranchAuditExport(Base):
    __tablename__ = 'branch_audit_exports'
    id = Column(Integer, primary_key=True)
    audit_id = Column(Integer, ForeignKey('branch_audits.id'), nullable=False)
    export_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    audit = relationship('BranchAudit', back_populates='exports')
    def __repr__(self):
        return f'<BranchAuditExport {self.id}>' 
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..extensions import Base

class BranchWorkflow(Base):
    __tablename__ = 'branch_workflows'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    steps = relationship('BranchWorkflowStep', back_populates='workflow')
    instances = relationship('BranchWorkflowInstance', back_populates='workflow')
    def __repr__(self):
        return f'<BranchWorkflow {self.name}>'

class BranchWorkflowStep(Base):
    __tablename__ = 'branch_workflow_steps'
    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey('branch_workflows.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    workflow = relationship('BranchWorkflow', back_populates='steps')
    def __repr__(self):
        return f'<BranchWorkflowStep {self.name}>'

class BranchWorkflowInstance(Base):
    __tablename__ = 'branch_workflow_instances'
    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey('branch_workflows.id'), nullable=False)
    status = Column(String(50), default='pending')
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    workflow = relationship('BranchWorkflow', back_populates='instances')
    def __repr__(self):
        return f'<BranchWorkflowInstance {self.id}>' 
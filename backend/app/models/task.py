from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from ..extensions import Base

class BranchTask(Base):
    __tablename__ = 'branch_tasks'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default='pending')
    due_date = Column(DateTime)
    created_by = Column(Integer, ForeignKey('users.id'))
    assigned_to = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    branch = relationship('Branch', backref='tasks')
    creator = relationship('User', foreign_keys=[created_by], backref='created_tasks')
    assignee = relationship('User', foreign_keys=[assigned_to], backref='assigned_tasks')
    comments = relationship('BranchTaskComment', back_populates='task')
    checklist = relationship('BranchTaskChecklist', back_populates='task')
    def __repr__(self):
        return f'<BranchTask {self.title}>'

class BranchTaskComment(Base):
    __tablename__ = 'branch_task_comments'
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey('branch_tasks.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    task = relationship('BranchTask', back_populates='comments')
    user = relationship('User', backref='task_comments')
    def __repr__(self):
        return f'<BranchTaskComment {self.id}>'

class BranchTaskChecklist(Base):
    __tablename__ = 'branch_task_checklists'
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey('branch_tasks.id'), nullable=False)
    item = Column(String(255), nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    task = relationship('BranchTask', back_populates='checklist')
    def __repr__(self):
        return f'<BranchTaskChecklist {self.item}>' 
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..extensions import Base

class BranchUser(Base):
    __tablename__ = 'branch_users'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    role = Column(String(50), nullable=False)
    status = Column(String(20), default='active')  # active, inactive, suspended
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    branch = relationship('Branch', backref='branch_users')
    user = relationship('User', backref='branch_users')
    schedules = relationship('BranchUserSchedule', back_populates='branch_user')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'role': self.role,
            'status': self.status,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchUser {self.id}>'

class BranchUserSchedule(Base):
    __tablename__ = 'branch_user_schedules'
    id = Column(Integer, primary_key=True)
    branch_user_id = Column(Integer, ForeignKey('branch_users.id'), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0-6 for Monday-Sunday
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    branch_user = relationship('BranchUser', back_populates='schedules')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_user_id': self.branch_user_id,
            'branch_name': self.branch_user.branch.name,
            'user_name': self.branch_user.user.name,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time.strftime('%H:%M'),
            'end_time': self.end_time.strftime('%H:%M'),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchUserSchedule {self.id}>' 
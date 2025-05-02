from ..extensions import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Time
from sqlalchemy.orm import relationship
from datetime import datetime

class BranchReport(Base):
    __tablename__ = 'branch_reports'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    report_type = Column(String(50), nullable=False)  # sales, inventory, performance, etc.
    title = Column(String(200), nullable=False)
    description = Column(Text)
    parameters = Column(JSON)  # Report parameters and filters
    data = Column(JSON, nullable=False)  # Report data
    format = Column(String(20), default='json')  # json, pdf, csv, excel
    status = Column(String(20), default='draft')  # draft, generated, archived
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='reports')
    creator = relationship('User', backref='created_reports')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'report_type': self.report_type,
            'title': self.title,
            'description': self.description,
            'parameters': self.parameters,
            'data': self.data,
            'format': self.format,
            'status': self.status,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchReport {self.branch.name} - {self.title}>'

class BranchReportSchedule(Base):
    __tablename__ = 'branch_report_schedules'

    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey('branch_reports.id'), nullable=False)
    schedule_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    schedule_time = Column(Time, nullable=False)
    recipients = Column(JSON, nullable=False)  # List of recipient user IDs
    last_run = Column(DateTime)
    next_run = Column(DateTime)
    status = Column(String(20), default='active')  # active, paused, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    report = relationship('BranchReport', backref='schedules')
    executions = relationship('BranchReportExecution', back_populates='schedule')

    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'report_title': self.report.title,
            'branch_name': self.report.branch.name,
            'schedule_type': self.schedule_type,
            'schedule_time': self.schedule_time.strftime('%H:%M'),
            'recipients': self.recipients,
            'last_run': self.last_run.isoformat() if self.last_run else None,
            'next_run': self.next_run.isoformat() if self.next_run else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchReportSchedule {self.report.title} - {self.schedule_type}>'

class BranchReportExecution(Base):
    __tablename__ = 'branch_report_executions'

    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey('branch_reports.id'), nullable=False)
    schedule_id = Column(Integer, ForeignKey('branch_report_schedules.id'))
    status = Column(String(20), default='running')  # running, completed, failed
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    error_message = Column(Text)
    result_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    report = relationship('BranchReport', backref='executions')
    schedule = relationship('BranchReportSchedule', back_populates='executions')

    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'report_title': self.report.title,
            'branch_name': self.report.branch.name,
            'schedule_id': self.schedule_id,
            'status': self.status,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'error_message': self.error_message,
            'result_data': self.result_data,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchReportExecution {self.report.title} - {self.status}>' 
from app import db
from datetime import datetime

class BranchReport(db.Model):
    __tablename__ = 'branch_reports'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)  # sales, inventory, performance, etc.
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    parameters = db.Column(db.JSON)  # Report parameters and filters
    data = db.Column(db.JSON, nullable=False)  # Report data
    format = db.Column(db.String(20), default='json')  # json, pdf, csv, excel
    status = db.Column(db.String(20), default='draft')  # draft, generated, archived
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='reports')
    creator = db.relationship('User', backref='created_reports')

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

class BranchReportSchedule(db.Model):
    __tablename__ = 'branch_report_schedules'

    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('branch_reports.id'), nullable=False)
    schedule_type = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly
    schedule_time = db.Column(db.Time, nullable=False)
    recipients = db.Column(db.JSON, nullable=False)  # List of recipient user IDs
    last_run = db.Column(db.DateTime)
    next_run = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')  # active, paused, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    report = db.relationship('BranchReport', backref='schedules')

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

class BranchReportExecution(db.Model):
    __tablename__ = 'branch_report_executions'

    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('branch_reports.id'), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('branch_report_schedules.id'))
    status = db.Column(db.String(20), default='running')  # running, completed, failed
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    result_data = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    report = db.relationship('BranchReport', backref='executions')
    schedule = db.relationship('BranchReportSchedule', backref='executions')

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
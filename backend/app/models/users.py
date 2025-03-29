from app import db
from datetime import datetime

class BranchUser(db.Model):
    __tablename__ = 'branch_users'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, inactive, suspended
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='users')
    user = db.relationship('User', backref='branches')

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
        return f'<BranchUser {self.branch.name} - {self.user.name}>'

class BranchUserSchedule(db.Model):
    __tablename__ = 'branch_user_schedules'

    id = db.Column(db.Integer, primary_key=True)
    branch_user_id = db.Column(db.Integer, db.ForeignKey('branch_users.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0-6 for Monday-Sunday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch_user = db.relationship('BranchUser', backref='schedules')

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
        return f'<BranchUserSchedule {self.branch_user.user.name} - {self.day_of_week}>' 
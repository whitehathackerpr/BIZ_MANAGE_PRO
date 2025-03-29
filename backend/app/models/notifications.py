from app import db
from datetime import datetime

class BranchNotification(db.Model):
    __tablename__ = 'branch_notifications'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # info, warning, error, success
    priority = db.Column(db.String(20), default='normal')  # low, normal, high
    status = db.Column(db.String(20), default='unread')  # unread, read, archived
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='notifications')
    creator = db.relationship('User', backref='created_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'priority': self.priority,
            'status': self.status,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchNotification {self.branch.name} - {self.title}>'

class BranchNotificationRecipient(db.Model):
    __tablename__ = 'branch_notification_recipients'

    id = db.Column(db.Integer, primary_key=True)
    notification_id = db.Column(db.Integer, db.ForeignKey('branch_notifications.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='unread')  # unread, read, archived
    read_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    notification = db.relationship('BranchNotification', backref='recipients')
    user = db.relationship('User', backref='received_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'notification_id': self.notification_id,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'status': self.status,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchNotificationRecipient {self.user.name} - {self.notification.title}>' 
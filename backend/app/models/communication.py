from app import db
from datetime import datetime

class BranchCommunication(db.Model):
    __tablename__ = 'branch_communication'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    communication_type = db.Column(db.String(50), nullable=False)  # announcement, notification, message, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, archived
    last_message = db.Column(db.DateTime)
    next_message = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='communication_channels')
    creator = db.relationship('User', backref='created_communication')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'communication_type': self.communication_type,
            'status': self.status,
            'last_message': self.last_message.isoformat() if self.last_message else None,
            'next_message': self.next_message.isoformat() if self.next_message else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchCommunication {self.branch.name} - {self.communication_type}>'

class BranchMessage(db.Model):
    __tablename__ = 'branch_messages'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    communication_id = db.Column(db.Integer, db.ForeignKey('branch_communication.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message_type = db.Column(db.String(50), nullable=False)  # text, image, file, etc.
    title = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    attachments = db.Column(db.JSON)  # List of attachment URLs
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    status = db.Column(db.String(20), default='sent')  # draft, sent, delivered, read
    scheduled_for = db.Column(db.DateTime)
    sent_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='messages')
    communication = db.relationship('BranchCommunication', backref='messages')
    sender = db.relationship('User', backref='sent_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'communication_id': self.communication_id,
            'communication_type': self.communication.communication_type,
            'sender_id': self.sender_id,
            'sender_name': self.sender.name,
            'message_type': self.message_type,
            'title': self.title,
            'content': self.content,
            'attachments': self.attachments,
            'priority': self.priority,
            'status': self.status,
            'scheduled_for': self.scheduled_for.isoformat() if self.scheduled_for else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchMessage {self.branch.name} - {self.message_type}>'

class BranchMessageRecipient(db.Model):
    __tablename__ = 'branch_message_recipients'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    message_id = db.Column(db.Integer, db.ForeignKey('branch_messages.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='sent')  # sent, delivered, read
    delivered_at = db.Column(db.DateTime)
    read_at = db.Column(db.DateTime)
    response = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='message_recipients')
    message = db.relationship('BranchMessage', backref='recipients')
    user = db.relationship('User', backref='received_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'message_id': self.message_id,
            'message_type': self.message.message_type,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'status': self.status,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'response': self.response,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchMessageRecipient {self.branch.name} - {self.user.name}>' 
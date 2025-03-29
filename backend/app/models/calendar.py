from app import db
from datetime import datetime

class BranchCalendar(db.Model):
    __tablename__ = 'branch_calendars'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    calendar_type = db.Column(db.String(50), nullable=False)  # operational, maintenance, training, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, archived
    last_event = db.Column(db.DateTime)
    next_event = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='calendars')
    creator = db.relationship('User', backref='created_calendars')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'calendar_type': self.calendar_type,
            'status': self.status,
            'last_event': self.last_event.isoformat() if self.last_event else None,
            'next_event': self.next_event.isoformat() if self.next_event else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchCalendar {self.branch.name} - {self.calendar_type}>'

class BranchEvent(db.Model):
    __tablename__ = 'branch_events'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    calendar_id = db.Column(db.Integer, db.ForeignKey('branch_calendars.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    event_type = db.Column(db.String(50), nullable=False)  # meeting, maintenance, training, etc.
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, in_progress, completed, cancelled
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    recurrence = db.Column(db.JSON)  # Recurrence pattern if applicable
    attachments = db.Column(db.JSON)  # List of attachment URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='events')
    calendar = db.relationship('BranchCalendar', backref='events')
    organizer = db.relationship('User', backref='organized_events')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'calendar_id': self.calendar_id,
            'calendar_type': self.calendar.calendar_type,
            'title': self.title,
            'description': self.description,
            'event_type': self.event_type,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'location': self.location,
            'organizer_id': self.organizer_id,
            'organizer_name': self.organizer.name,
            'status': self.status,
            'priority': self.priority,
            'recurrence': self.recurrence,
            'attachments': self.attachments,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchEvent {self.branch.name} - {self.title}>'

class BranchEventParticipant(db.Model):
    __tablename__ = 'branch_event_participants'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('branch_events.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(20), default='attendee')  # organizer, presenter, attendee
    status = db.Column(db.String(20), default='pending')  # pending, accepted, declined, tentative
    response_time = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='event_participants')
    event = db.relationship('BranchEvent', backref='participants')
    user = db.relationship('User', backref='event_participations')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'event_id': self.event_id,
            'event_title': self.event.title,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'role': self.role,
            'status': self.status,
            'response_time': self.response_time.isoformat() if self.response_time else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchEventParticipant {self.branch.name} - {self.user.name}>'

class BranchCalendarShare(db.Model):
    __tablename__ = 'branch_calendar_shares'

    id = db.Column(db.Integer, primary_key=True)
    calendar_id = db.Column(db.Integer, db.ForeignKey('branch_calendars.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    permission = db.Column(db.String(20), default='view')  # view, edit, manage
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    calendar = db.relationship('BranchCalendar', backref='shares')
    user = db.relationship('User', foreign_keys=[user_id], backref='shared_calendars')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_calendar_shares')

    def to_dict(self):
        return {
            'id': self.id,
            'calendar_id': self.calendar_id,
            'calendar_name': self.calendar.name,
            'branch_name': self.calendar.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'permission': self.permission,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchCalendarShare {self.calendar.name} - {self.user.name}>' 
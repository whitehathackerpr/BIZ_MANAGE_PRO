from app import db
from datetime import datetime

class BranchSurvey(db.Model):
    __tablename__ = 'branch_surveys'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    survey_type = db.Column(db.String(50), nullable=False)  # customer, employee, service, etc.
    questions = db.Column(db.JSON, nullable=False)  # List of survey questions
    status = db.Column(db.String(20), default='draft')  # draft, active, closed
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='surveys')
    creator = db.relationship('User', backref='created_surveys')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'title': self.title,
            'description': self.description,
            'survey_type': self.survey_type,
            'questions': self.questions,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchSurvey {self.branch.name} - {self.title}>'

class BranchSurveyResponse(db.Model):
    __tablename__ = 'branch_survey_responses'

    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('branch_surveys.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    answers = db.Column(db.JSON, nullable=False)  # User's answers to survey questions
    status = db.Column(db.String(20), default='completed')  # completed, partial, abandoned
    started_at = db.Column(db.DateTime, nullable=False)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    survey = db.relationship('BranchSurvey', backref='responses')
    user = db.relationship('User', backref='survey_responses')

    def to_dict(self):
        return {
            'id': self.id,
            'survey_id': self.survey_id,
            'survey_title': self.survey.title,
            'branch_name': self.survey.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'answers': self.answers,
            'status': self.status,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchSurveyResponse {self.survey.title} - {self.user.name}>'

class BranchFeedback(db.Model):
    __tablename__ = 'branch_feedback'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    feedback_type = db.Column(db.String(50), nullable=False)  # service, product, experience, etc.
    rating = db.Column(db.Integer)  # 1-5 rating
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, resolved
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    reviewed_at = db.Column(db.DateTime)
    response = db.Column(db.Text)  # Branch's response to feedback
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='feedback')
    user = db.relationship('User', foreign_keys=[user_id], backref='given_feedback')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_feedback')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'feedback_type': self.feedback_type,
            'rating': self.rating,
            'content': self.content,
            'status': self.status,
            'reviewed_by': self.reviewed_by,
            'reviewer_name': self.reviewer.name if self.reviewer else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'response': self.response,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchFeedback {self.branch.name} - {self.user.name}>' 
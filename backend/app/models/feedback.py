from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..extensions import Base

class BranchSurvey(Base):
    __tablename__ = 'branch_surveys'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    survey_type = Column(String(50), nullable=False)  # customer, employee, service, etc.
    questions = Column(Text, nullable=False)  # List of survey questions
    status = Column(String(20), default='draft')  # draft, active, closed
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    responses = relationship('BranchSurveyResponse', back_populates='survey')

    # Relationships
    branch = relationship('Branch', backref='surveys')
    creator = relationship('User', backref='created_surveys')

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
        return f'<BranchSurvey {self.title}>'

class BranchSurveyResponse(Base):
    __tablename__ = 'branch_survey_responses'
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey('branch_surveys.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    answers = Column(Text, nullable=False)  # User's answers to survey questions
    status = Column(String(20), default='completed')  # completed, partial, abandoned
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    survey = relationship('BranchSurvey', back_populates='responses')
    user = relationship('User', backref='survey_responses')

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
        return f'<BranchSurveyResponse {self.id}>'

class BranchFeedback(Base):
    __tablename__ = 'branch_feedbacks'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    feedback_type = Column(String(50), nullable=False)  # service, product, experience, etc.
    rating = Column(Integer)  # 1-5 rating
    content = Column(Text, nullable=False)
    status = Column(String(20), default='pending')  # pending, reviewed, resolved
    reviewed_by = Column(Integer, ForeignKey('users.id'))
    reviewed_at = Column(DateTime)
    response = Column(Text)  # Branch's response to feedback
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    branch = relationship('Branch', backref='feedbacks')
    user = relationship('User', backref='feedbacks', foreign_keys=[user_id])
    reviewer = relationship('User', foreign_keys=[reviewed_by], backref='reviewed_feedback')

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
        return f'<BranchFeedback {self.id}>'

class CustomerFeedback(Base):
    __tablename__ = 'customer_feedbacks'
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customer.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('product.id'), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship('Customer', backref='feedbacks')
    product = relationship('Product')

    def __repr__(self):
        return f'<CustomerFeedback {self.id}>' 
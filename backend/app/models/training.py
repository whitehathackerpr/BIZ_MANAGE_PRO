from ..extensions import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

class BranchTraining(Base):
    __tablename__ = 'branch_training'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    training_type = Column(String(50), nullable=False)  # safety, technical, soft_skills, etc.
    status = Column(String(20), default='active')  # active, inactive, completed
    last_session = Column(DateTime)
    next_session = Column(DateTime)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='training_programs')
    creator = relationship('User', backref='created_training')
    sessions = relationship('BranchTrainingSession', back_populates='training')
    enrollments = relationship('BranchTrainingEnrollment', back_populates='training')
    assessments = relationship('BranchTrainingAssessment', back_populates='training')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'training_type': self.training_type,
            'status': self.status,
            'last_session': self.last_session.isoformat() if self.last_session else None,
            'next_session': self.next_session.isoformat() if self.next_session else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchTraining {self.branch.name} - {self.training_type}>'

class BranchTrainingSession(Base):
    __tablename__ = 'branch_training_sessions'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    training_id = Column(Integer, ForeignKey('branch_training.id'), nullable=False)
    trainer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    session_date = Column(DateTime, nullable=False)
    session_type = Column(String(50), nullable=False)  # classroom, online, practical
    title = Column(String(200), nullable=False)
    description = Column(Text)
    duration = Column(Integer)  # Duration in minutes
    materials = Column(JSON)  # List of training materials
    status = Column(String(20), default='scheduled')  # scheduled, in_progress, completed
    feedback = Column(JSON)  # List of participant feedback
    photos = Column(JSON)  # List of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='training_sessions')
    training = relationship('BranchTraining', back_populates='sessions')
    trainer = relationship('User', backref='conducted_sessions')
    participants = relationship('BranchTrainingParticipant', back_populates='session')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'training_id': self.training_id,
            'training_type': self.training.training_type,
            'trainer_id': self.trainer_id,
            'trainer_name': self.trainer.name,
            'session_date': self.session_date.isoformat(),
            'session_type': self.session_type,
            'title': self.title,
            'description': self.description,
            'duration': self.duration,
            'materials': self.materials,
            'status': self.status,
            'feedback': self.feedback,
            'photos': self.photos,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchTrainingSession {self.branch.name} - {self.title}>'

class BranchTrainingParticipant(Base):
    __tablename__ = 'branch_training_participants'

    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    session_id = Column(Integer, ForeignKey('branch_training_sessions.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='registered')  # registered, attended, completed
    attendance = Column(DateTime)
    completion = Column(DateTime)
    feedback = Column(Text)
    assessment_score = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship('Branch', backref='training_participants')
    session = relationship('BranchTrainingSession', back_populates='participants')
    user = relationship('User', backref='training_participations')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'session_id': self.session_id,
            'session_title': self.session.title,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'status': self.status,
            'attendance': self.attendance.isoformat() if self.attendance else None,
            'completion': self.completion.isoformat() if self.completion else None,
            'feedback': self.feedback,
            'assessment_score': self.assessment_score,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchTrainingParticipant {self.branch.name} - {self.user.name}>'

class BranchTrainingEnrollment(Base):
    __tablename__ = 'branch_training_enrollments'

    id = Column(Integer, primary_key=True)
    training_id = Column(Integer, ForeignKey('branch_training.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='enrolled')  # enrolled, in_progress, completed, dropped
    progress = Column(Integer, default=0)  # Progress percentage
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    training = relationship('BranchTraining', back_populates='enrollments')
    user = relationship('User', backref='training_enrollments')

    def to_dict(self):
        return {
            'id': self.id,
            'training_id': self.training_id,
            'training_title': self.training.training_type,
            'branch_name': self.training.branch.name,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'status': self.status,
            'progress': self.progress,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchTrainingEnrollment {self.training.training_type} - {self.user.name}>'

class BranchTrainingAssessment(Base):
    __tablename__ = 'branch_training_assessments'

    id = Column(Integer, primary_key=True)
    training_id = Column(Integer, ForeignKey('branch_training.id'), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    questions = Column(JSON, nullable=False)  # List of assessment questions
    passing_score = Column(Integer, nullable=False)  # Minimum score to pass
    time_limit = Column(Integer)  # Time limit in minutes
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    training = relationship('BranchTraining', back_populates='assessments')
    creator = relationship('User', backref='created_assessments')
    results = relationship('BranchTrainingAssessmentResult', back_populates='assessment')

    def to_dict(self):
        return {
            'id': self.id,
            'training_id': self.training_id,
            'training_title': self.training.training_type,
            'branch_name': self.training.branch.name,
            'title': self.title,
            'description': self.description,
            'questions': self.questions,
            'passing_score': self.passing_score,
            'time_limit': self.time_limit,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchTrainingAssessment {self.training.training_type} - {self.title}>'

class BranchTrainingAssessmentResult(Base):
    __tablename__ = 'branch_training_assessment_results'

    id = Column(Integer, primary_key=True)
    assessment_id = Column(Integer, ForeignKey('branch_training_assessments.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    score = Column(Integer, nullable=False)
    answers = Column(JSON, nullable=False)  # User's answers
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime)
    status = Column(String(20), default='completed')  # completed, failed, abandoned
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessment = relationship('BranchTrainingAssessment', back_populates='results')
    user = relationship('User', backref='assessment_results')

    def to_dict(self):
        return {
            'id': self.id,
            'assessment_id': self.assessment_id,
            'assessment_title': self.assessment.title,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'score': self.score,
            'answers': self.answers,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchTrainingAssessmentResult {self.assessment.title} - {self.user.name}>'
 
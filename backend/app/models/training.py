from app import db
from datetime import datetime

class BranchTraining(db.Model):
    __tablename__ = 'branch_training'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    training_type = db.Column(db.String(50), nullable=False)  # safety, technical, soft_skills, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, completed
    last_session = db.Column(db.DateTime)
    next_session = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='training_programs')
    creator = db.relationship('User', backref='created_training')

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

class BranchTrainingSession(db.Model):
    __tablename__ = 'branch_training_sessions'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    training_id = db.Column(db.Integer, db.ForeignKey('branch_training.id'), nullable=False)
    trainer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_date = db.Column(db.DateTime, nullable=False)
    session_type = db.Column(db.String(50), nullable=False)  # classroom, online, practical
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    duration = db.Column(db.Integer)  # Duration in minutes
    materials = db.Column(db.JSON)  # List of training materials
    status = db.Column(db.String(20), default='scheduled')  # scheduled, in_progress, completed
    feedback = db.Column(db.JSON)  # List of participant feedback
    photos = db.Column(db.JSON)  # List of photo URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='training_sessions')
    training = db.relationship('BranchTraining', backref='sessions')
    trainer = db.relationship('User', backref='conducted_sessions')

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

class BranchTrainingParticipant(db.Model):
    __tablename__ = 'branch_training_participants'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('branch_training_sessions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='registered')  # registered, attended, completed
    attendance = db.Column(db.DateTime)
    completion = db.Column(db.DateTime)
    feedback = db.Column(db.Text)
    assessment_score = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='training_participants')
    session = db.relationship('BranchTrainingSession', backref='participants')
    user = db.relationship('User', backref='training_participations')

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

class BranchTrainingEnrollment(db.Model):
    __tablename__ = 'branch_training_enrollments'

    id = db.Column(db.Integer, primary_key=True)
    training_id = db.Column(db.Integer, db.ForeignKey('branch_training.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='enrolled')  # enrolled, in_progress, completed, dropped
    progress = db.Column(db.Integer, default=0)  # Progress percentage
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    training = db.relationship('BranchTraining', backref='enrollments')
    user = db.relationship('User', backref='training_enrollments')

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

class BranchTrainingAssessment(db.Model):
    __tablename__ = 'branch_training_assessments'

    id = db.Column(db.Integer, primary_key=True)
    training_id = db.Column(db.Integer, db.ForeignKey('branch_training.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    questions = db.Column(db.JSON, nullable=False)  # List of assessment questions
    passing_score = db.Column(db.Integer, nullable=False)  # Minimum score to pass
    time_limit = db.Column(db.Integer)  # Time limit in minutes
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    training = db.relationship('BranchTraining', backref='assessments')
    creator = db.relationship('User', backref='created_assessments')

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

class BranchTrainingAssessmentResult(db.Model):
    __tablename__ = 'branch_training_assessment_results'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('branch_training_assessments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    answers = db.Column(db.JSON, nullable=False)  # User's answers
    started_at = db.Column(db.DateTime, nullable=False)
    completed_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='completed')  # completed, failed, abandoned
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessment = db.relationship('BranchTrainingAssessment', backref='results')
    user = db.relationship('User', backref='assessment_results')

    def to_dict(self):
        return {
            'id': self.id,
            'assessment_id': self.assessment_id,
            'assessment_title': self.assessment.title,
            'training_title': self.assessment.training.training_type,
            'branch_name': self.assessment.training.branch.name,
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
 
from app import db
from datetime import datetime

class BranchWorkflow(db.Model):
    __tablename__ = 'branch_workflows'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    workflow_type = db.Column(db.String(50), nullable=False)  # approval, review, process, etc.
    status = db.Column(db.String(20), default='active')  # active, inactive, archived
    last_run = db.Column(db.DateTime)
    next_run = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='workflows')
    creator = db.relationship('User', backref='created_workflows')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'workflow_type': self.workflow_type,
            'status': self.status,
            'last_run': self.last_run.isoformat() if self.last_run else None,
            'next_run': self.next_run.isoformat() if self.next_run else None,
            'notes': self.notes,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchWorkflow {self.branch.name} - {self.workflow_type}>'

class BranchWorkflowStep(db.Model):
    __tablename__ = 'branch_workflow_steps'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    workflow_id = db.Column(db.Integer, db.ForeignKey('branch_workflows.id'), nullable=False)
    step_type = db.Column(db.String(50), nullable=False)  # action, approval, notification, etc.
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    order = db.Column(db.Integer, nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.JSON)  # Step action details
    conditions = db.Column(db.JSON)  # Step conditions
    timeout = db.Column(db.Integer)  # Timeout in minutes
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='workflow_steps')
    workflow = db.relationship('BranchWorkflow', backref='steps')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_steps')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_steps')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'workflow_id': self.workflow_id,
            'workflow_type': self.workflow.workflow_type,
            'step_type': self.step_type,
            'title': self.title,
            'description': self.description,
            'order': self.order,
            'assigned_to': self.assigned_to,
            'assignee_name': self.assignee.name if self.assignee else None,
            'action': self.action,
            'conditions': self.conditions,
            'timeout': self.timeout,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchWorkflowStep {self.branch.name} - {self.title}>'

class BranchWorkflowInstance(db.Model):
    __tablename__ = 'branch_workflow_instances'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    workflow_id = db.Column(db.Integer, db.ForeignKey('branch_workflows.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    started_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    data = db.Column(db.JSON)  # Workflow instance data
    current_step = db.Column(db.Integer, db.ForeignKey('branch_workflow_steps.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='workflow_instances')
    workflow = db.relationship('BranchWorkflow', backref='instances')
    starter = db.relationship('User', foreign_keys=[started_by], backref='started_workflows')
    step = db.relationship('BranchWorkflowStep', foreign_keys=[current_step], backref='active_instances')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'workflow_id': self.workflow_id,
            'workflow_type': self.workflow.workflow_type,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'started_by': self.started_by,
            'starter_name': self.starter.name,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'data': self.data,
            'current_step': self.current_step,
            'current_step_title': self.step.title if self.step else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchWorkflowInstance {self.branch.name} - {self.title}>' 
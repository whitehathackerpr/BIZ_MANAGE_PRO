"""Add employee management

Revision ID: 002_add_employee_management
Revises: 001_initial_schema
Create Date: 2024-01-02 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '002_add_employee_management'
down_revision = '001_initial_schema'

def upgrade():
    # Employees table
    op.create_table(
        'employees',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('position', sa.String(50), nullable=False),
        sa.Column('department', sa.String(50)),
        sa.Column('hire_date', sa.Date, nullable=False),
        sa.Column('salary', sa.Numeric(10, 2)),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Employee Attendance table
    op.create_table(
        'employee_attendance',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('employee_id', sa.Integer, sa.ForeignKey('employees.id'), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('time_in', sa.Time),
        sa.Column('time_out', sa.Time),
        sa.Column('status', sa.String(20), nullable=False),  # present, absent, late
        sa.Column('notes', sa.Text)
    )

    # Employee Leave table
    op.create_table(
        'employee_leave',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('employee_id', sa.Integer, sa.ForeignKey('employees.id'), nullable=False),
        sa.Column('start_date', sa.Date, nullable=False),
        sa.Column('end_date', sa.Date, nullable=False),
        sa.Column('leave_type', sa.String(20), nullable=False),  # sick, vacation, personal
        sa.Column('status', sa.String(20), nullable=False, default='pending'),
        sa.Column('reason', sa.Text),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

def downgrade():
    op.drop_table('employee_leave')
    op.drop_table('employee_attendance')
    op.drop_table('employees') 
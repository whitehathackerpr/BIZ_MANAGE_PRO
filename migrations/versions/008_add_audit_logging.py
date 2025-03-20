"""Add audit logging system

Revision ID: 008_add_audit_logging
Revises: 007_add_notification_system
Create Date: 2024-01-08 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '008_add_audit_logging'
down_revision = '007_add_notification_system'

def upgrade():
    # Audit Logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('action', sa.String(50), nullable=False),  # create, update, delete, view
        sa.Column('entity_type', sa.String(50), nullable=False),  # product, sale, user
        sa.Column('entity_id', sa.Integer),
        sa.Column('old_values', sa.JSON),  # Previous state of the entity
        sa.Column('new_values', sa.JSON),  # New state of the entity
        sa.Column('ip_address', sa.String(45)),
        sa.Column('user_agent', sa.String(255)),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Security Events table
    op.create_table(
        'security_events',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('event_type', sa.String(50), nullable=False),  # login, logout, password_change
        sa.Column('status', sa.String(20), nullable=False),  # success, failure
        sa.Column('ip_address', sa.String(45)),
        sa.Column('user_agent', sa.String(255)),
        sa.Column('details', sa.JSON),  # Additional event details
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Data Change History table
    op.create_table(
        'data_change_history',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('table_name', sa.String(100), nullable=False),
        sa.Column('record_id', sa.Integer, nullable=False),
        sa.Column('action', sa.String(20), nullable=False),  # insert, update, delete
        sa.Column('changed_fields', sa.JSON),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Create indexes
    op.create_index('ix_audit_logs_entity', 'audit_logs', 
                    ['entity_type', 'entity_id', 'created_at'])
    op.create_index('ix_security_events_user', 'security_events', 
                    ['user_id', 'event_type', 'created_at'])
    op.create_index('ix_data_change_history', 'data_change_history', 
                    ['table_name', 'record_id', 'created_at'])

def downgrade():
    op.drop_index('ix_data_change_history')
    op.drop_index('ix_security_events_user')
    op.drop_index('ix_audit_logs_entity')
    op.drop_table('data_change_history')
    op.drop_table('security_events')
    op.drop_table('audit_logs') 
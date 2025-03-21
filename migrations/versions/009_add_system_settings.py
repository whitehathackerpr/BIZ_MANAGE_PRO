"""Add system settings and configuration

Revision ID: 009_add_system_settings
Revises: 008_add_audit_logging
Create Date: 2024-01-09 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '009_add_system_settings'
down_revision = '008_add_audit_logging'

def upgrade():
    # System Settings table
    op.create_table(
        'system_settings',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('key', sa.String(100), nullable=False),
        sa.Column('value', sa.Text),
        sa.Column('data_type', sa.String(20), nullable=False),  # string, int, boolean, json
        sa.Column('description', sa.Text),
        sa.Column('is_public', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Feature Flags table
    op.create_table(
        'feature_flags',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('enabled', sa.Boolean, nullable=False, default=False),
        sa.Column('start_date', sa.DateTime),
        sa.Column('end_date', sa.DateTime),
        sa.Column('user_group', sa.String(50)),  # all, admin, beta_users
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # API Keys table
    op.create_table(
        'api_keys',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('key_name', sa.String(100), nullable=False),
        sa.Column('api_key', sa.String(64), nullable=False, unique=True),
        sa.Column('permissions', sa.JSON),
        sa.Column('last_used_at', sa.DateTime),
        sa.Column('expires_at', sa.DateTime),
        sa.Column('is_active', sa.Boolean, nullable=False, default=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Background Jobs table
    op.create_table(
        'background_jobs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('job_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),  # pending, running, completed, failed
        sa.Column('parameters', sa.JSON),
        sa.Column('result', sa.JSON),
        sa.Column('error_message', sa.Text),
        sa.Column('started_at', sa.DateTime),
        sa.Column('completed_at', sa.DateTime),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Create unique constraints and indexes
    op.create_unique_constraint('uq_system_settings_category_key', 
                              'system_settings', ['category', 'key'])
    op.create_unique_constraint('uq_feature_flags_name', 
                              'feature_flags', ['name'])
    op.create_index('ix_api_keys_user', 'api_keys', ['user_id', 'is_active'])
    op.create_index('ix_background_jobs_status', 'background_jobs', 
                    ['status', 'job_type', 'created_at'])

def downgrade():
    op.drop_index('ix_background_jobs_status')
    op.drop_index('ix_api_keys_user')
    op.drop_constraint('uq_feature_flags_name', 'feature_flags')
    op.drop_constraint('uq_system_settings_category_key', 'system_settings')
    op.drop_table('background_jobs')
    op.drop_table('api_keys')
    op.drop_table('feature_flags')
    op.drop_table('system_settings') 
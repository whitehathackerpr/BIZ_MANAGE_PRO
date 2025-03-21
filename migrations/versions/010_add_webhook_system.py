"""Add webhook system

Revision ID: 010_add_webhook_system
Revises: 009_add_system_settings
Create Date: 2024-01-10 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '010_add_webhook_system'
down_revision = '009_add_system_settings'

def upgrade():
    # Webhook Endpoints table
    op.create_table(
        'webhook_endpoints',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('events', sa.JSON, nullable=False),  # Array of event types to trigger webhook
        sa.Column('headers', sa.JSON),  # Custom headers to send
        sa.Column('secret_key', sa.String(100)),  # For webhook signature
        sa.Column('version', sa.String(10), default='1.0'),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('timeout', sa.Integer, default=30),  # Timeout in seconds
        sa.Column('retry_count', sa.Integer, default=3),
        sa.Column('created_by', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Webhook Deliveries table
    op.create_table(
        'webhook_deliveries',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('webhook_id', sa.Integer, sa.ForeignKey('webhook_endpoints.id')),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('payload', sa.JSON, nullable=False),
        sa.Column('response_status', sa.Integer),
        sa.Column('response_headers', sa.JSON),
        sa.Column('response_body', sa.Text),
        sa.Column('error_message', sa.Text),
        sa.Column('attempt_count', sa.Integer, default=0),
        sa.Column('next_retry_at', sa.DateTime),
        sa.Column('status', sa.String(20), nullable=False),  # pending, success, failed
        sa.Column('duration_ms', sa.Integer),  # Request duration in milliseconds
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('completed_at', sa.DateTime)
    )

    # Create indexes
    op.create_index('ix_webhook_endpoints_events', 'webhook_endpoints', 
                    ['is_active'], postgresql_using='gin')
    op.create_index('ix_webhook_deliveries_status', 'webhook_deliveries', 
                    ['status', 'next_retry_at'])

def downgrade():
    op.drop_index('ix_webhook_deliveries_status')
    op.drop_index('ix_webhook_endpoints_events')
    op.drop_table('webhook_deliveries')
    op.drop_table('webhook_endpoints') 
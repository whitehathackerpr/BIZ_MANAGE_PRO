"""Add notification system

Revision ID: 007_add_notification_system
Revises: 006_add_forecasting_tables
Create Date: 2024-01-07 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '007_add_notification_system'
down_revision = '006_add_forecasting_tables'

def upgrade():
    # Notification Templates table
    op.create_table(
        'notification_templates',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),  # email, sms, in_app
        sa.Column('subject', sa.String(200)),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('variables', sa.JSON),  # List of available template variables
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('template_id', sa.Integer, sa.ForeignKey('notification_templates.id')),
        sa.Column('type', sa.String(50), nullable=False),  # email, sms, in_app
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('status', sa.String(20), nullable=False),  # pending, sent, failed
        sa.Column('priority', sa.String(20), default='normal'),  # low, normal, high
        sa.Column('read_at', sa.DateTime),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('sent_at', sa.DateTime)
    )

    # Notification Settings table
    op.create_table(
        'notification_settings',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),  # email, sms, in_app
        sa.Column('event', sa.String(100), nullable=False),  # low_stock, new_sale, etc.
        sa.Column('enabled', sa.Boolean, nullable=False, default=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Create indexes
    op.create_index('ix_notifications_user_status', 'notifications', ['user_id', 'status'])
    op.create_index('ix_notification_settings_user', 'notification_settings', 
                    ['user_id', 'type', 'event'])

def downgrade():
    op.drop_index('ix_notification_settings_user')
    op.drop_index('ix_notifications_user_status')
    op.drop_table('notification_settings')
    op.drop_table('notifications')
    op.drop_table('notification_templates') 
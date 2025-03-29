"""create notification settings table

Revision ID: create_notification_settings
Revises: create_user_profiles_and_notifications
Create Date: 2024-03-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'create_notification_settings'
down_revision = 'create_user_profiles_and_notifications'
branch_labels = None
depends_on = None

def upgrade():
    # Create notification_settings table
    op.create_table('notification_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('email_notifications', sa.Boolean(), nullable=True),
        sa.Column('push_notifications', sa.Boolean(), nullable=True),
        sa.Column('in_app_notifications', sa.Boolean(), nullable=True),
        sa.Column('low_stock_alerts', sa.Boolean(), nullable=True),
        sa.Column('order_updates', sa.Boolean(), nullable=True),
        sa.Column('system_alerts', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    
    # Insert default settings for existing users
    op.execute("""
        INSERT INTO notification_settings (
            user_id, email_notifications, push_notifications,
            in_app_notifications, low_stock_alerts, order_updates,
            system_alerts, created_at, updated_at
        )
        SELECT 
            id, true, true, true, true, true, true,
            NOW(), NOW()
        FROM users
        WHERE id NOT IN (
            SELECT user_id FROM notification_settings
        )
    """)

def downgrade():
    # Drop table
    op.drop_table('notification_settings') 
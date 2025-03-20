"""Add integration system

Revision ID: 011_add_integration_system
Revises: 010_add_webhook_system
Create Date: 2024-01-11 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '011_add_integration_system'
down_revision = '010_add_webhook_system'

def upgrade():
    # Integration Providers table
    op.create_table(
        'integration_providers',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),  # payment, shipping, accounting, etc.
        sa.Column('description', sa.Text),
        sa.Column('config_schema', sa.JSON),  # JSON Schema for configuration
        sa.Column('icon_url', sa.String(255)),
        sa.Column('documentation_url', sa.String(255)),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Integration Instances table
    op.create_table(
        'integration_instances',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('provider_id', sa.Integer, sa.ForeignKey('integration_providers.id')),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('config', sa.JSON, nullable=False),  # Encrypted configuration
        sa.Column('credentials', sa.JSON),  # Encrypted credentials
        sa.Column('status', sa.String(20), nullable=False),  # active, inactive, error
        sa.Column('error_message', sa.Text),
        sa.Column('last_sync_at', sa.DateTime),
        sa.Column('created_by', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Integration Sync Logs table
    op.create_table(
        'integration_sync_logs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('instance_id', sa.Integer, sa.ForeignKey('integration_instances.id')),
        sa.Column('sync_type', sa.String(50), nullable=False),  # full, incremental
        sa.Column('status', sa.String(20), nullable=False),  # pending, success, failed
        sa.Column('records_processed', sa.Integer, default=0),
        sa.Column('records_failed', sa.Integer, default=0),
        sa.Column('error_details', sa.JSON),
        sa.Column('started_at', sa.DateTime, nullable=False),
        sa.Column('completed_at', sa.DateTime),
        sa.Column('duration_seconds', sa.Integer)
    )

    # Integration Data Mappings table
    op.create_table(
        'integration_data_mappings',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('instance_id', sa.Integer, sa.ForeignKey('integration_instances.id')),
        sa.Column('local_model', sa.String(50), nullable=False),  # product, customer, order
        sa.Column('remote_model', sa.String(50), nullable=False),
        sa.Column('mapping_rules', sa.JSON, nullable=False),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Create indexes
    op.create_index('ix_integration_instances_status', 'integration_instances', 
                    ['provider_id', 'status'])
    op.create_index('ix_integration_sync_logs_instance', 'integration_sync_logs', 
                    ['instance_id', 'started_at'])

def downgrade():
    op.drop_index('ix_integration_sync_logs_instance')
    op.drop_index('ix_integration_instances_status')
    op.drop_table('integration_data_mappings')
    op.drop_table('integration_sync_logs')
    op.drop_table('integration_instances')
    op.drop_table('integration_providers') 
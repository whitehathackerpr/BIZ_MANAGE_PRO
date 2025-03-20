"""Add OAuth system

Revision ID: 012_add_oauth_system
Revises: 011_add_integration_system
Create Date: 2024-01-12 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '012_add_oauth_system'
down_revision = '011_add_integration_system'

def upgrade():
    # OAuth Providers table
    op.create_table(
        'oauth_providers',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('client_id', sa.String(100), nullable=False),
        sa.Column('client_secret', sa.String(100), nullable=False),
        sa.Column('authorize_url', sa.String(255), nullable=False),
        sa.Column('token_url', sa.String(255), nullable=False),
        sa.Column('userinfo_url', sa.String(255)),
        sa.Column('scope', sa.String(255)),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # OAuth User Tokens table
    op.create_table(
        'oauth_user_tokens',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('provider_id', sa.Integer, sa.ForeignKey('oauth_providers.id')),
        sa.Column('access_token', sa.Text, nullable=False),
        sa.Column('refresh_token', sa.Text),
        sa.Column('expires_at', sa.DateTime),
        sa.Column('scope', sa.String(255)),
        sa.Column('token_type', sa.String(20)),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # External Service Connections table
    op.create_table(
        'external_service_connections',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('service_name', sa.String(50), nullable=False),
        sa.Column('service_type', sa.String(50), nullable=False),  # api, database, cloud
        sa.Column('config', sa.JSON, nullable=False),
        sa.Column('credentials', sa.JSON),
        sa.Column('status', sa.String(20), nullable=False),  # active, inactive, error
        sa.Column('last_check', sa.DateTime),
        sa.Column('error_message', sa.Text),
        sa.Column('created_by', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Create indexes
    op.create_index('ix_oauth_user_tokens_user', 'oauth_user_tokens', 
                    ['user_id', 'provider_id'])
    op.create_index('ix_external_service_connections_status', 
                    'external_service_connections', ['service_type', 'status'])

def downgrade():
    op.drop_index('ix_external_service_connections_status')
    op.drop_index('ix_oauth_user_tokens_user')
    op.drop_table('external_service_connections')
    op.drop_table('oauth_user_tokens')
    op.drop_table('oauth_providers') 
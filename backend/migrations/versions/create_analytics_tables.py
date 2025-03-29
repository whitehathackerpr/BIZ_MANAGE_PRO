"""create analytics tables

Revision ID: create_analytics_tables
Revises: create_sales_table
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'create_analytics_tables'
down_revision = 'create_sales_table'
branch_labels = None
depends_on = None

def upgrade():
    # Create analytics_events table
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('event_data', sa.JSON(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create analytics_metrics table
    op.create_table(
        'analytics_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('metric_type', sa.String(length=50), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('metric_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id')
    )

    # Create analytics_reports table
    op.create_table(
        'analytics_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('report_type', sa.String(length=50), nullable=False),
        sa.Column('report_data', sa.JSON(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for better query performance
    op.create_index('ix_analytics_events_event_type', 'analytics_events', ['event_type'])
    op.create_index('ix_analytics_events_user_id', 'analytics_events', ['user_id'])
    op.create_index('ix_analytics_events_created_at', 'analytics_events', ['created_at'])
    
    op.create_index('ix_analytics_metrics_metric_type', 'analytics_metrics', ['metric_type'])
    op.create_index('ix_analytics_metrics_metric_date', 'analytics_metrics', ['metric_date'])
    
    op.create_index('ix_analytics_reports_report_type', 'analytics_reports', ['report_type'])
    op.create_index('ix_analytics_reports_created_by', 'analytics_reports', ['created_by'])
    op.create_index('ix_analytics_reports_created_at', 'analytics_reports', ['created_at'])

    # Insert sample data
    op.execute("""
        INSERT INTO analytics_metrics (
            metric_type, metric_value, metric_date, created_at
        )
        SELECT 
            'daily_sales',
            FLOOR(RANDOM() * 10000)::float,
            CURRENT_DATE - (FLOOR(RANDOM() * 30) || ' days')::interval,
            NOW()
        FROM generate_series(1, 30)
    """)

    op.execute("""
        INSERT INTO analytics_metrics (
            metric_type, metric_value, metric_date, created_at
        )
        SELECT 
            'new_customers',
            FLOOR(RANDOM() * 10)::float,
            CURRENT_DATE - (FLOOR(RANDOM() * 30) || ' days')::interval,
            NOW()
        FROM generate_series(1, 30)
    """)

def downgrade():
    # Drop indexes first
    op.drop_index('ix_analytics_events_event_type')
    op.drop_index('ix_analytics_events_user_id')
    op.drop_index('ix_analytics_events_created_at')
    
    op.drop_index('ix_analytics_metrics_metric_type')
    op.drop_index('ix_analytics_metrics_metric_date')
    
    op.drop_index('ix_analytics_reports_report_type')
    op.drop_index('ix_analytics_reports_created_by')
    op.drop_index('ix_analytics_reports_created_at')

    # Drop tables
    op.drop_table('analytics_reports')
    op.drop_table('analytics_metrics')
    op.drop_table('analytics_events') 
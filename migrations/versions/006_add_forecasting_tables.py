"""Add forecasting tables

Revision ID: 006_add_forecasting_tables
Revises: 005_add_reporting_tables
Create Date: 2024-01-06 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '006_add_forecasting_tables'
down_revision = '005_add_reporting_tables'

def upgrade():
    # Sales Forecasts table
    op.create_table(
        'sales_forecasts',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('products.id')),
        sa.Column('predicted_sales', sa.Integer, nullable=False),
        sa.Column('confidence_level', sa.Numeric(5, 2)),  # percentage
        sa.Column('actual_sales', sa.Integer),  # To compare with predictions
        sa.Column('accuracy', sa.Numeric(5, 2)),  # percentage
        sa.Column('model_version', sa.String(50)),  # Version of prediction model used
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Key Performance Indicators table
    op.create_table(
        'key_performance_indicators',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('type', sa.String(50), nullable=False),  # sales, inventory, financial
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('metric_value', sa.Numeric(12, 2), nullable=False),
        sa.Column('target_value', sa.Numeric(12, 2)),
        sa.Column('achievement_rate', sa.Numeric(5, 2)),  # percentage
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Trend Analysis table
    op.create_table(
        'trend_analysis',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('type', sa.String(50), nullable=False),  # sales, product, category
        sa.Column('entity_id', sa.Integer),  # ID of product/category being analyzed
        sa.Column('trend_direction', sa.String(10)),  # up, down, stable
        sa.Column('trend_strength', sa.Numeric(5, 2)),  # percentage
        sa.Column('notes', sa.Text),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Create indexes for performance
    op.create_index('ix_sales_forecasts_date', 'sales_forecasts', ['date', 'product_id'])
    op.create_index('ix_kpi_date_type', 'key_performance_indicators', ['date', 'type'])
    op.create_index('ix_trend_analysis_date', 'trend_analysis', ['date', 'type', 'entity_id'])

def downgrade():
    op.drop_index('ix_trend_analysis_date')
    op.drop_index('ix_kpi_date_type')
    op.drop_index('ix_sales_forecasts_date')
    op.drop_table('trend_analysis')
    op.drop_table('key_performance_indicators')
    op.drop_table('sales_forecasts') 
"""Add analytics tables

Revision ID: 004_add_analytics_tables
Revises: 003_add_inventory_tracking
Create Date: 2024-01-04 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '004_add_analytics_tables'
down_revision = '003_add_inventory_tracking'

def upgrade():
    # Daily Sales Summary table
    op.create_table(
        'daily_sales_summary',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('date', sa.Date, nullable=False, unique=True),
        sa.Column('total_sales', sa.Numeric(12, 2), nullable=False, default=0),
        sa.Column('total_transactions', sa.Integer, nullable=False, default=0),
        sa.Column('average_transaction_value', sa.Numeric(10, 2)),
        sa.Column('peak_hour', sa.Integer),  # 0-23 representing hour of day
        sa.Column('total_items_sold', sa.Integer, nullable=False, default=0),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Product Performance Metrics table
    op.create_table(
        'product_performance_metrics',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('products.id'), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('units_sold', sa.Integer, nullable=False, default=0),
        sa.Column('revenue', sa.Numeric(10, 2), nullable=False, default=0),
        sa.Column('profit_margin', sa.Numeric(5, 2)),  # percentage
        sa.Column('stock_turnover_rate', sa.Numeric(5, 2)),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Customer Analytics table
    op.create_table(
        'customer_analytics',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('customer_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('total_purchases', sa.Integer, default=0),
        sa.Column('total_spent', sa.Numeric(12, 2), default=0),
        sa.Column('average_purchase_value', sa.Numeric(10, 2)),
        sa.Column('last_purchase_date', sa.DateTime),
        sa.Column('favorite_category_id', sa.Integer, sa.ForeignKey('categories.id')),
        sa.Column('purchase_frequency_days', sa.Integer),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Create indexes for performance
    op.create_index('ix_daily_sales_summary_date', 'daily_sales_summary', ['date'])
    op.create_index('ix_product_performance_date', 'product_performance_metrics', 
                    ['date', 'product_id'])

def downgrade():
    op.drop_index('ix_product_performance_date')
    op.drop_index('ix_daily_sales_summary_date')
    op.drop_table('customer_analytics')
    op.drop_table('product_performance_metrics')
    op.drop_table('daily_sales_summary') 
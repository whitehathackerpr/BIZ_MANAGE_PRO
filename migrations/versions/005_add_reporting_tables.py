"""Add reporting tables

Revision ID: 005_add_reporting_tables
Revises: 004_add_analytics_tables
Create Date: 2024-01-05 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '005_add_reporting_tables'
down_revision = '004_add_analytics_tables'

def upgrade():
    # Report Templates table
    op.create_table(
        'report_templates',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('type', sa.String(50), nullable=False),  # sales, inventory, financial
        sa.Column('config', sa.JSON),  # Store report configuration
        sa.Column('created_by', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Generated Reports table
    op.create_table(
        'generated_reports',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('template_id', sa.Integer, sa.ForeignKey('report_templates.id')),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('parameters', sa.JSON),  # Store parameters used to generate report
        sa.Column('file_path', sa.String(255)),  # Path to stored report file
        sa.Column('status', sa.String(20), nullable=False),  # pending, completed, failed
        sa.Column('generated_by', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Financial Reports table
    op.create_table(
        'financial_reports',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('type', sa.String(50), nullable=False),  # daily, monthly, annual
        sa.Column('total_revenue', sa.Numeric(12, 2), nullable=False),
        sa.Column('total_cost', sa.Numeric(12, 2), nullable=False),
        sa.Column('gross_profit', sa.Numeric(12, 2), nullable=False),
        sa.Column('operating_expenses', sa.Numeric(12, 2)),
        sa.Column('net_profit', sa.Numeric(12, 2)),
        sa.Column('tax_amount', sa.Numeric(12, 2)),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Inventory Reports table
    op.create_table(
        'inventory_reports',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('total_items', sa.Integer, nullable=False),
        sa.Column('total_value', sa.Numeric(12, 2), nullable=False),
        sa.Column('low_stock_items', sa.Integer),
        sa.Column('out_of_stock_items', sa.Integer),
        sa.Column('inventory_turnover', sa.Numeric(5, 2)),
        sa.Column('average_days_to_sell', sa.Numeric(5, 2)),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Report Schedules table
    op.create_table(
        'report_schedules',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('template_id', sa.Integer, sa.ForeignKey('report_templates.id')),
        sa.Column('frequency', sa.String(20), nullable=False),  # daily, weekly, monthly
        sa.Column('parameters', sa.JSON),
        sa.Column('next_run', sa.DateTime, nullable=False),
        sa.Column('last_run', sa.DateTime),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('created_by', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Create indexes for performance
    op.create_index('ix_financial_reports_date', 'financial_reports', ['date', 'type'])
    op.create_index('ix_inventory_reports_date', 'inventory_reports', ['date'])
    op.create_index('ix_report_schedules_next_run', 'report_schedules', ['next_run', 'status'])

def downgrade():
    op.drop_index('ix_report_schedules_next_run')
    op.drop_index('ix_inventory_reports_date')
    op.drop_index('ix_financial_reports_date')
    op.drop_table('report_schedules')
    op.drop_table('inventory_reports')
    op.drop_table('financial_reports')
    op.drop_table('generated_reports')
    op.drop_table('report_templates') 
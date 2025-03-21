"""Add inventory tracking

Revision ID: 003_add_inventory_tracking
Revises: 002_add_employee_management
Create Date: 2024-01-03 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '003_add_inventory_tracking'
down_revision = '002_add_employee_management'

def upgrade():
    # Inventory Transactions table
    op.create_table(
        'inventory_transactions',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('products.id'), nullable=False),
        sa.Column('type', sa.String(20), nullable=False),  # in, out, adjustment
        sa.Column('quantity', sa.Integer, nullable=False),
        sa.Column('reference_type', sa.String(20)),  # sale, purchase, return
        sa.Column('reference_id', sa.Integer),
        sa.Column('notes', sa.Text),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Purchase Orders table
    op.create_table(
        'purchase_orders',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('supplier_id', sa.Integer, sa.ForeignKey('suppliers.id'), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, default='pending'),
        sa.Column('total', sa.Numeric(10, 2), nullable=False),
        sa.Column('expected_date', sa.Date),
        sa.Column('notes', sa.Text),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Purchase Order Items table
    op.create_table(
        'purchase_order_items',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('purchase_order_id', sa.Integer, sa.ForeignKey('purchase_orders.id'), nullable=False),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('total', sa.Numeric(10, 2), nullable=False)
    )

def downgrade():
    op.drop_table('purchase_order_items')
    op.drop_table('purchase_orders')
    op.drop_table('inventory_transactions') 
"""Initial database schema

Revision ID: 001_initial_schema
Revises: None
Create Date: 2024-01-01 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = '001_initial_schema'
down_revision = None

def upgrade():
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String(120), unique=True, nullable=False),
        sa.Column('name', sa.String(120), nullable=False),
        sa.Column('password_hash', sa.String(256), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, server_default='user'),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('last_login', sa.DateTime)
    )

    # Products table
    op.create_table(
        'products',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(120), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('stock', sa.Integer, nullable=False, default=0),
        sa.Column('barcode', sa.String(50), unique=True),
        sa.Column('sku', sa.String(50), unique=True),
        sa.Column('category_id', sa.Integer, sa.ForeignKey('categories.id')),
        sa.Column('supplier_id', sa.Integer, sa.ForeignKey('suppliers.id')),
        sa.Column('reorder_point', sa.Integer, default=10),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, onupdate=datetime.utcnow)
    )

    # Categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('description', sa.Text)
    )

    # Suppliers table
    op.create_table(
        'suppliers',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(120), nullable=False),
        sa.Column('contact_person', sa.String(120)),
        sa.Column('email', sa.String(120)),
        sa.Column('phone', sa.String(20)),
        sa.Column('address', sa.Text),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Sales table
    op.create_table(
        'sales',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('total', sa.Numeric(10, 2), nullable=False),
        sa.Column('payment_method', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, default='completed'),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow)
    )

    # Sale Items table
    op.create_table(
        'sale_items',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('sale_id', sa.Integer, sa.ForeignKey('sales.id'), nullable=False),
        sa.Column('product_id', sa.Integer, sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('total', sa.Numeric(10, 2), nullable=False)
    )

def downgrade():
    op.drop_table('sale_items')
    op.drop_table('sales')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('suppliers')
    op.drop_table('users') 
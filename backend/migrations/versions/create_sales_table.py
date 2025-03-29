"""create sales table

Revision ID: create_sales_table
Revises: create_notification_settings
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'create_sales_table'
down_revision = 'create_notification_settings'
branch_labels = None
depends_on = None

def upgrade():
    # Create sales table
    op.create_table(
        'sales',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for better query performance
    op.create_index('ix_sales_customer_id', 'sales', ['customer_id'])
    op.create_index('ix_sales_product_id', 'sales', ['product_id'])
    op.create_index('ix_sales_created_at', 'sales', ['created_at'])
    op.create_index('ix_sales_status', 'sales', ['status'])

    # Insert sample data
    op.execute("""
        INSERT INTO sales (
            customer_id, product_id, quantity, unit_price, total_amount,
            payment_method, status, notes, created_at, updated_at
        )
        SELECT 
            u.id as customer_id,
            p.id as product_id,
            FLOOR(RANDOM() * 5) + 1 as quantity,
            p.price as unit_price,
            (FLOOR(RANDOM() * 5) + 1) * p.price as total_amount,
            CASE FLOOR(RANDOM() * 3)
                WHEN 0 THEN 'cash'
                WHEN 1 THEN 'card'
                ELSE 'bank_transfer'
            END as payment_method,
            'completed' as status,
            'Sample sale transaction' as notes,
            NOW() - (FLOOR(RANDOM() * 30) || ' days')::interval as created_at,
            NOW() as updated_at
        FROM users u
        CROSS JOIN products p
        WHERE u.role = 'customer'
        LIMIT 100
    """)

def downgrade():
    # Drop indexes
    op.drop_index('ix_sales_customer_id')
    op.drop_index('ix_sales_product_id')
    op.drop_index('ix_sales_created_at')
    op.drop_index('ix_sales_status')

    # Drop sales table
    op.drop_table('sales') 
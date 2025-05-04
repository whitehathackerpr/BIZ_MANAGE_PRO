"""add customer feedback table

Revision ID: add_customer_feedback_table
Revises: initial_migration
Create Date: 2024-05-02 18:05:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_customer_feedback_table'
down_revision = 'initial_migration'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'customer_feedbacks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text()),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )

def downgrade():
    op.drop_table('customer_feedbacks') 
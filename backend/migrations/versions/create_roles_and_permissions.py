"""create roles and permissions tables

Revision ID: create_roles_and_permissions
Revises: create_users
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'create_roles_and_permissions'
down_revision = 'create_users'
branch_labels = None
depends_on = None

def upgrade():
    # Create permissions table
    op.create_table('permissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=200), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=200), nullable=True),
        sa.Column('is_system', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create role_permissions association table
    op.create_table('role_permissions',
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('permission_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.PrimaryKeyConstraint('role_id', 'permission_id')
    )
    
    # Add role_id to users table
    op.add_column('users', sa.Column('role_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'users', 'roles', ['role_id'], ['id'])
    
    # Insert default roles and permissions
    op.execute("""
        INSERT INTO permissions (name, description, category, created_at, updated_at)
        VALUES 
            ('manage_users', 'Manage user accounts', 'user_management', NOW(), NOW()),
            ('manage_roles', 'Manage roles and permissions', 'user_management', NOW(), NOW()),
            ('view_dashboard', 'View dashboard', 'general', NOW(), NOW()),
            ('manage_settings', 'Manage system settings', 'system', NOW(), NOW())
    """)
    
    op.execute("""
        INSERT INTO roles (name, description, is_system, created_at, updated_at)
        VALUES 
            ('admin', 'System administrator with full access', true, NOW(), NOW()),
            ('user', 'Regular user with basic access', true, NOW(), NOW())
    """)
    
    # Assign all permissions to admin role
    op.execute("""
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r, permissions p
        WHERE r.name = 'admin'
    """)
    
    # Assign basic permissions to user role
    op.execute("""
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r, permissions p
        WHERE r.name = 'user' AND p.name IN ('view_dashboard')
    """)

def downgrade():
    # Remove role_id from users table
    op.drop_constraint(None, 'users', type_='foreignkey')
    op.drop_column('users', 'role_id')
    
    # Drop tables
    op.drop_table('role_permissions')
    op.drop_table('roles')
    op.drop_table('permissions') 
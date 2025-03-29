from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import Role, Permission
from ..extensions import db
from ..utils.decorators import admin_required
from ..utils.validation import validate_role_data

roles_bp = Blueprint('roles', __name__)

@roles_bp.route('/api/roles', methods=['GET'])
@jwt_required()
@admin_required
def get_roles():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    
    query = Role.query
    
    if search:
        query = query.filter(Role.name.ilike(f'%{search}%'))
    
    roles = query.order_by(Role.name.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'roles': [role.to_dict() for role in roles.items],
        'total': roles.total,
        'pages': roles.pages,
        'current_page': roles.page
    })

@roles_bp.route('/api/roles', methods=['POST'])
@jwt_required()
@admin_required
def create_role():
    data = request.get_json()
    
    # Validate role data
    errors = validate_role_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Check if role name already exists
    if Role.query.filter_by(name=data['name']).first():
        return jsonify({
            'error': 'Role name already exists'
        }), 400
    
    # Create role
    role = Role(
        name=data['name'],
        description=data.get('description'),
        is_system=data.get('is_system', False)
    )
    
    # Add permissions
    if 'permission_ids' in data:
        permissions = Permission.query.filter(
            Permission.id.in_(data['permission_ids'])
        ).all()
        role.permissions = permissions
    
    db.session.add(role)
    db.session.commit()
    
    return jsonify({
        'message': 'Role created successfully',
        'role': role.to_dict()
    }), 201

@roles_bp.route('/api/roles/<int:id>', methods=['GET'])
@jwt_required()
@admin_required
def get_role(id):
    role = Role.query.get_or_404(id)
    return jsonify(role.to_dict())

@roles_bp.route('/api/roles/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_role(id):
    role = Role.query.get_or_404(id)
    
    # Prevent modifying system roles
    if role.is_system:
        return jsonify({
            'error': 'Cannot modify system roles'
        }), 400
    
    data = request.get_json()
    
    # Validate role data
    errors = validate_role_data(data, partial=True)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Update role fields
    if 'name' in data and data['name'] != role.name:
        if Role.query.filter_by(name=data['name']).first():
            return jsonify({
                'error': 'Role name already exists'
            }), 400
        role.name = data['name']
    
    if 'description' in data:
        role.description = data['description']
    
    # Update permissions
    if 'permission_ids' in data:
        permissions = Permission.query.filter(
            Permission.id.in_(data['permission_ids'])
        ).all()
        role.permissions = permissions
    
    db.session.commit()
    
    return jsonify({
        'message': 'Role updated successfully',
        'role': role.to_dict()
    })

@roles_bp.route('/api/roles/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_role(id):
    role = Role.query.get_or_404(id)
    
    # Prevent deleting system roles
    if role.is_system:
        return jsonify({
            'error': 'Cannot delete system roles'
        }), 400
    
    # Check if role is assigned to any users
    if role.users:
        return jsonify({
            'error': 'Cannot delete role that is assigned to users'
        }), 400
    
    db.session.delete(role)
    db.session.commit()
    
    return jsonify({
        'message': 'Role deleted successfully'
    })

@roles_bp.route('/api/roles/<int:id>/permissions', methods=['GET'])
@jwt_required()
@admin_required
def get_role_permissions(id):
    role = Role.query.get_or_404(id)
    return jsonify({
        'permissions': [permission.to_dict() for permission in role.permissions]
    })

@roles_bp.route('/api/roles/<int:id>/permissions', methods=['PUT'])
@jwt_required()
@admin_required
def update_role_permissions(id):
    role = Role.query.get_or_404(id)
    
    # Prevent modifying system roles
    if role.is_system:
        return jsonify({
            'error': 'Cannot modify system roles'
        }), 400
    
    data = request.get_json()
    permission_ids = data.get('permission_ids', [])
    
    # Get permissions
    permissions = Permission.query.filter(
        Permission.id.in_(permission_ids)
    ).all()
    
    # Update role permissions
    role.permissions = permissions
    db.session.commit()
    
    return jsonify({
        'message': 'Role permissions updated successfully',
        'permissions': [permission.to_dict() for permission in permissions]
    })

@roles_bp.route('/api/permissions', methods=['GET'])
@jwt_required()
@admin_required
def get_permissions():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    category = request.args.get('category')
    
    query = Permission.query
    
    if search:
        query = query.filter(
            or_(
                Permission.name.ilike(f'%{search}%'),
                Permission.description.ilike(f'%{search}%')
            )
        )
    if category:
        query = query.filter_by(category=category)
    
    permissions = query.order_by(Permission.name.asc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'permissions': [permission.to_dict() for permission in permissions.items],
        'total': permissions.total,
        'pages': permissions.pages,
        'current_page': permissions.page
    })

@roles_bp.route('/api/permissions', methods=['POST'])
@jwt_required()
@admin_required
def create_permission():
    data = request.get_json()
    
    # Validate permission data
    if not data.get('name') or not data.get('description'):
        return jsonify({
            'error': 'Name and description are required'
        }), 400
    
    # Check if permission name already exists
    if Permission.query.filter_by(name=data['name']).first():
        return jsonify({
            'error': 'Permission name already exists'
        }), 400
    
    # Create permission
    permission = Permission(
        name=data['name'],
        description=data['description'],
        category=data.get('category', 'general')
    )
    
    db.session.add(permission)
    db.session.commit()
    
    return jsonify({
        'message': 'Permission created successfully',
        'permission': permission.to_dict()
    }), 201

@roles_bp.route('/api/permissions/<int:id>', methods=['GET'])
@jwt_required()
@admin_required
def get_permission(id):
    permission = Permission.query.get_or_404(id)
    return jsonify(permission.to_dict())

@roles_bp.route('/api/permissions/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_permission(id):
    permission = Permission.query.get_or_404(id)
    data = request.get_json()
    
    # Update permission fields
    if 'name' in data and data['name'] != permission.name:
        if Permission.query.filter_by(name=data['name']).first():
            return jsonify({
                'error': 'Permission name already exists'
            }), 400
        permission.name = data['name']
    
    if 'description' in data:
        permission.description = data['description']
    if 'category' in data:
        permission.category = data['category']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Permission updated successfully',
        'permission': permission.to_dict()
    })

@roles_bp.route('/api/permissions/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_permission(id):
    permission = Permission.query.get_or_404(id)
    
    # Check if permission is assigned to any roles
    if permission.roles:
        return jsonify({
            'error': 'Cannot delete permission that is assigned to roles'
        }), 400
    
    db.session.delete(permission)
    db.session.commit()
    
    return jsonify({
        'message': 'Permission deleted successfully'
    }) 
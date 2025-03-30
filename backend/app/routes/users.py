from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import User, UserProfile, Role, Permission
from ..extensions import db
from ..utils.decorators import admin_required
from ..utils.validation import validate_user_data
from ..utils.notifications import create_notification

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    role = request.args.get('role')
    status = request.args.get('status')
    
    query = User.query
    
    if search:
        query = query.filter(
            or_(
                User.username.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%'),
                User.first_name.ilike(f'%{search}%'),
                User.last_name.ilike(f'%{search}%')
            )
        )
    if role:
        query = query.join(Role).filter(Role.name == role)
    if status:
        query = query.filter(User.is_active == (status == 'active'))
    
    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': users.page
    })

@users_bp.route('/api/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    data = request.get_json()
    
    # Validate user data
    errors = validate_user_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({
            'error': 'Email already registered'
        }), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({
            'error': 'Username already taken'
        }), 400
    
    # Create user
    user = User(
        username=data['username'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        is_active=data.get('is_active', True),
        role_id=data.get('role_id')
    )
    
    # Create user profile
    profile = UserProfile(
        user=user,
        phone=data.get('phone'),
        address=data.get('address'),
        city=data.get('city'),
        state=data.get('state'),
        country=data.get('country'),
        postal_code=data.get('postal_code'),
        avatar_url=data.get('avatar_url')
    )
    
    db.session.add(user)
    db.session.add(profile)
    db.session.commit()
    
    # Create welcome notification
    create_notification(
        user_id=user.id,
        title='Welcome',
        message='Welcome to the system! Please complete your profile.',
        type='system'
    )
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict()
    }), 201

@users_bp.route('/api/users/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    current_user_id = get_jwt_identity()
    
    # Allow users to view their own profile or admins to view any profile
    if current_user_id != id:
        user = User.query.get_or_404(id)
        if not user.is_admin:
            return jsonify({
                'error': 'Unauthorized access'
            }), 403
    
    user = User.query.get_or_404(id)
    return jsonify(user.to_dict())

@users_bp.route('/api/users/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    current_user_id = get_jwt_identity()
    
    # Allow users to update their own profile or admins to update any profile
    if current_user_id != id:
        user = User.query.get_or_404(id)
        if not user.is_admin:
            return jsonify({
                'error': 'Unauthorized access'
            }), 403
    
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    # Validate user data
    errors = validate_user_data(data, partial=True)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Update user fields
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'error': 'Username already taken'
            }), 400
        user.username = data['username']
    
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'Email already registered'
            }), 400
        user.email = data['email']
    
    if 'password' in data:
        user.password = generate_password_hash(data['password'])
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'role_id' in data:
        user.role_id = data['role_id']
    
    # Update profile fields
    if user.profile:
        profile = user.profile
        if 'phone' in data:
            profile.phone = data['phone']
        if 'address' in data:
            profile.address = data['address']
        if 'city' in data:
            profile.city = data['city']
        if 'state' in data:
            profile.state = data['state']
        if 'country' in data:
            profile.country = data['country']
        if 'postal_code' in data:
            profile.postal_code = data['postal_code']
        if 'avatar_url' in data:
            profile.avatar_url = data['avatar_url']
    else:
        profile = UserProfile(
            user=user,
            phone=data.get('phone'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            country=data.get('country'),
            postal_code=data.get('postal_code'),
            avatar_url=data.get('avatar_url')
        )
        db.session.add(profile)
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    })

@users_bp.route('/api/users/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(id):
    user = User.query.get_or_404(id)
    
    # Prevent deleting the last admin
    if user.is_admin and User.query.filter_by(is_admin=True).count() == 1:
        return jsonify({
            'error': 'Cannot delete the last admin user'
        }), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User deleted successfully'
    })

@users_bp.route('/api/users/<int:id>/profile', methods=['GET'])
@jwt_required()
def get_user_profile(id):
    current_user_id = get_jwt_identity()
    
    # Allow users to view their own profile or admins to view any profile
    if current_user_id != id:
        user = User.query.get_or_404(id)
        if not user.is_admin:
            return jsonify({
                'error': 'Unauthorized access'
            }), 403
    
    user = User.query.get_or_404(id)
    return jsonify(user.profile.to_dict() if user.profile else {})

@users_bp.route('/api/users/<int:id>/profile', methods=['PUT'])
@jwt_required()
def update_user_profile(id):
    current_user_id = get_jwt_identity()
    
    # Allow users to update their own profile or admins to update any profile
    if current_user_id != id:
        user = User.query.get_or_404(id)
        if not user.is_admin:
            return jsonify({
                'error': 'Unauthorized access'
            }), 403
    
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    if not user.profile:
        profile = UserProfile(user=user)
        db.session.add(profile)
    else:
        profile = user.profile
    
    # Update profile fields
    if 'phone' in data:
        profile.phone = data['phone']
    if 'address' in data:
        profile.address = data['address']
    if 'city' in data:
        profile.city = data['city']
    if 'state' in data:
        profile.state = data['state']
    if 'country' in data:
        profile.country = data['country']
    if 'postal_code' in data:
        profile.postal_code = data['postal_code']
    if 'avatar_url' in data:
        profile.avatar_url = data['avatar_url']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict()
    })

@users_bp.route('/api/users/<int:id>/permissions', methods=['GET'])
@jwt_required()
@admin_required
def get_user_permissions(id):
    user = User.query.get_or_404(id)
    return jsonify({
        'permissions': [permission.to_dict() for permission in user.role.permissions]
    })

@users_bp.route('/api/users/<int:id>/permissions', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_permissions(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    permission_ids = data.get('permission_ids', [])
    
    # Get permissions
    permissions = Permission.query.filter(
        Permission.id.in_(permission_ids)
    ).all()
    
    # Update role permissions
    user.role.permissions = permissions
    db.session.commit()
    
    return jsonify({
        'message': 'User permissions updated successfully',
        'permissions': [permission.to_dict() for permission in permissions]
    })

@users_bp.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    return jsonify(user.to_dict())

@users_bp.route('/api/users/me/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()
    
    # Validate current password
    if not check_password_hash(user.password, data['current_password']):
        return jsonify({
            'error': 'Current password is incorrect'
        }), 400
    
    # Validate new password
    if len(data['new_password']) < 8:
        return jsonify({
            'error': 'New password must be at least 8 characters long'
        }), 400
    
    # Update password
    user.password = generate_password_hash(data['new_password'])
    db.session.commit()
    
    return jsonify({
        'message': 'Password updated successfully'
    }) 
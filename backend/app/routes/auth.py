from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from datetime import timedelta
from ..models import User
from ..extensions import db
from ..utils.email import send_password_reset_email
from ..utils.security import generate_reset_token, verify_reset_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        if not user.is_active:
            return jsonify({
                'error': 'Account is deactivated'
            }), 403
        
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=1)
        )
        
        return jsonify({
            'message': 'Logged in successfully',
            'access_token': access_token,
            'user': user.to_dict()
        })
    
    return jsonify({
        'error': 'Invalid email or password'
    }), 401

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({
            'error': 'Email already registered'
        }), 400
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({
            'error': 'Username already taken'
        }), 400
    
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        phone=data.get('phone')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(hours=1)
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/api/auth/me')
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'error': 'User not found'
        }), 404
    
    return jsonify(user.to_dict())

@auth_bp.route('/api/auth/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'error': 'User not found'
        }), 404
    
    data = request.get_json()
    
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'Email already registered'
            }), 400
        user.email = data['email']
    
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'error': 'Username already taken'
            }), 400
        user.username = data['username']
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    })

@auth_bp.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'error': 'User not found'
        }), 404
    
    data = request.get_json()
    
    if not user.check_password(data.get('current_password')):
        return jsonify({
            'error': 'Current password is incorrect'
        }), 401
    
    user.set_password(data.get('new_password'))
    db.session.commit()
    
    return jsonify({
        'message': 'Password changed successfully'
    })

@auth_bp.route('/api/auth/reset-password-request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user:
        token = generate_reset_token(user.id)
        reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password/{token}"
        send_password_reset_email(user.email, reset_url)
        
        return jsonify({
            'message': 'Password reset instructions sent to your email'
        })
    
    return jsonify({
        'error': 'Email not found'
    }), 404

@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    user_id = verify_reset_token(token)
    
    if not user_id:
        return jsonify({
            'error': 'Invalid or expired reset token'
        }), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            'error': 'User not found'
        }), 404
    
    user.set_password(data.get('new_password'))
    db.session.commit()
    
    return jsonify({
        'message': 'Password reset successfully'
    })

@auth_bp.route('/api/auth/verify-email/<token>')
def verify_email(token):
    user_id = verify_reset_token(token)
    
    if not user_id:
        return jsonify({
            'error': 'Invalid or expired verification token'
        }), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            'error': 'User not found'
        }), 404
    
    user.is_active = True
    db.session.commit()
    
    return jsonify({
        'message': 'Email verified successfully'
    }) 
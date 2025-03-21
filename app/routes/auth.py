from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        login_user(user)
        return jsonify({
            'message': 'Logged in successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
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
    
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
    }), 201

@auth_bp.route('/api/auth/logout')
@login_required
def logout():
    logout_user()
    return jsonify({
        'message': 'Logged out successfully'
    })

@auth_bp.route('/api/auth/reset-password-request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user:
        # Here you would typically send a password reset email
        return jsonify({
            'message': 'Password reset instructions sent to your email'
        })
    
    return jsonify({
        'error': 'Email not found'
    }), 404

@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    # Here you would typically verify the reset token and update the password
    return jsonify({
        'message': 'Password reset successfully'
    })

@auth_bp.route('/google-login')
def google_login():
    # Google OAuth logic here
    return redirect(url_for('auth.login'))

@auth_bp.route('/github-login')
def github_login():
    # GitHub OAuth logic here
    return redirect(url_for('auth.login'))
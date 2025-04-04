from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_restx import Namespace, Resource, fields
from app.models import User
from app import db
from datetime import timedelta, datetime
from app.utils.auth import generate_password_reset_token, verify_password_reset_token
from app.utils.email import send_password_reset_email
from app.utils.rate_limiting import rate_limit
from flask_login import login_user, logout_user, login_required, current_user

# Create namespace
ns = Namespace('auth', description='Authentication operations')

# Define models for request/response documentation
login_model = ns.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

register_model = ns.model('Register', {
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password'),
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name')
})

token_model = ns.model('Token', {
    'access_token': fields.String(description='JWT access token'),
    'token_type': fields.String(description='Token type'),
    'expires_in': fields.Integer(description='Token expiration time in seconds')
})

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'user')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
            
        login_user(user)
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Invalid email or password'}), 401

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    current_user_id = get_jwt_identity()
    logout_user()
    return jsonify({'message': 'Successfully logged out'})

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'last_login': user.last_login.isoformat() if user.last_login else None
    })

@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 400
        
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'})

@ns.route('/refresh')
class TokenRefresh(Resource):
    @ns.doc(security='Bearer')
    @ns.response(200, 'Success')
    @ns.response(401, 'Invalid token')
    @jwt_required()
    def post(self):
        """Refresh access token endpoint"""
        current_user_id = get_jwt_identity()
        new_token = create_access_token(
            identity=current_user_id,
            expires_delta=timedelta(hours=1)
        )
        return {
            'access_token': new_token,
            'token_type': 'bearer',
            'expires_in': 3600
        }, 200

@ns.route('/forgot-password')
class ForgotPassword(Resource):
    @ns.expect(ns.model('ForgotPassword', {
        'email': fields.String(required=True, description='User email')
    }))
    @ns.response(200, 'Success')
    @ns.response(404, 'User not found')
    @rate_limit(3, 60)  # 3 attempts per minute
    def post(self):
        """Request password reset endpoint"""
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()
        
        if user:
            token = generate_password_reset_token(user)
            send_password_reset_email(user, token)
            return {'message': 'Password reset email sent'}, 200
        return {'message': 'User not found'}, 404

@ns.route('/reset-password/<token>')
class ResetPassword(Resource):
    @ns.expect(ns.model('ResetPassword', {
        'password': fields.String(required=True, description='New password')
    }))
    @ns.response(200, 'Success')
    @ns.response(400, 'Invalid token')
    @rate_limit(3, 60)  # 3 attempts per minute
    def post(self, token):
        """Reset password endpoint"""
        data = request.get_json()
        user = verify_password_reset_token(token)
        
        if user:
            user.set_password(data.get('password'))
            db.session.commit()
            return {'message': 'Password has been reset'}, 200
        return {'message': 'Invalid or expired token'}, 400 
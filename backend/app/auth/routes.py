from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_restx import Namespace, Resource, fields
from app.models import User
from app import db
from datetime import timedelta
from app.utils.auth import generate_password_reset_token, verify_password_reset_token
from app.utils.email import send_password_reset_email
from app.utils.rate_limiting import rate_limit

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

@ns.route('/login')
class Login(Resource):
    @ns.expect(login_model)
    @ns.response(200, 'Success')
    @ns.response(401, 'Invalid credentials')
    @rate_limit(5, 60)  # 5 attempts per minute
    def post(self):
        """User login endpoint"""
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()
        
        if user and user.check_password(data.get('password')):
            access_token = create_access_token(
                identity=user.id,
                expires_delta=timedelta(hours=1)
            )
            return {
                'access_token': access_token,
                'token_type': 'bearer',
                'expires_in': 3600
            }, 200
        return {'message': 'Invalid credentials'}, 401

@ns.route('/register')
class Register(Resource):
    @ns.expect(register_model)
    @ns.response(201, 'User created successfully')
    @ns.response(400, 'Validation error')
    @ns.response(409, 'User already exists')
    @rate_limit(3, 60)  # 3 attempts per minute
    def post(self):
        """User registration endpoint"""
        data = request.get_json()
        
        if User.query.filter_by(email=data.get('email')).first():
            return {'message': 'Email already registered'}, 409
            
        if User.query.filter_by(username=data.get('username')).first():
            return {'message': 'Username already taken'}, 409
            
        user = User(
            username=data.get('username'),
            email=data.get('email'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        return {'message': 'User registered successfully'}, 201

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

@ns.route('/logout')
class Logout(Resource):
    @ns.doc(security='Bearer')
    @ns.response(200, 'Success')
    @ns.response(401, 'Invalid token')
    @jwt_required()
    def post(self):
        """User logout endpoint"""
        # In a real application, you might want to blacklist the token
        return {'message': 'Successfully logged out'}, 200

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
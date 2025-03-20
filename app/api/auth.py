from flask_restx import Namespace, Resource, fields
from flask import request, current_app
from ..models.user import User
from ..utils.auth import create_token, require_auth
from werkzeug.security import check_password_hash

api = Namespace('auth', description='Authentication operations')

# Models
login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

register_model = api.model('Register', {
    'name': fields.String(required=True, description='User name'),
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    @api.doc('user_login')
    def post(self):
        """User login endpoint"""
        data = request.get_json()
        
        user = User.query.filter_by(email=data['email']).first()
        if user and check_password_hash(user.password_hash, data['password']):
            token = create_token(user)
            return {
                'token': token,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role
                }
            }, 200
        return {'message': 'Invalid credentials'}, 401

@api.route('/register')
class Register(Resource):
    @api.expect(register_model)
    @api.doc('user_register')
    def post(self):
        """User registration endpoint"""
        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return {'message': 'Email already registered'}, 400

        user = User(
            name=data['name'],
            email=data['email']
        )
        user.set_password(data['password'])
        user.save()

        return {
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            }
        }, 201 
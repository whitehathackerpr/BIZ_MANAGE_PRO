from flask_security import Security, SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from flask import current_app
from .models.user import User, Role
from .extensions import db

# Initialize Flask-Security
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security()

def init_security(app):
    """Initialize security settings"""
    security.init_app(app, user_datastore)
    
    # Security configurations
    app.config['SECURITY_PASSWORD_SALT'] = app.config.get('SECURITY_PASSWORD_SALT', 'your-secret-salt')
    app.config['SECURITY_PASSWORD_HASH'] = 'bcrypt'
    app.config['SECURITY_PASSWORD_COMPLEXITY_CHECKER'] = 'zxcvbn'
    app.config['SECURITY_PASSWORD_MIN_LENGTH'] = 8
    app.config['SECURITY_PASSWORD_REQUIRE_SPECIAL_CHARS'] = True
    app.config['SECURITY_PASSWORD_REQUIRE_NUMBERS'] = True
    app.config['SECURITY_PASSWORD_REQUIRE_UPPERCASE'] = True
    app.config['SECURITY_PASSWORD_REQUIRE_LOWERCASE'] = True
    
    # Session security
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # CSRF protection
    app.config['WTF_CSRF_ENABLED'] = True
    app.config['WTF_CSRF_SECRET_KEY'] = app.config.get('WTF_CSRF_SECRET_KEY', 'your-csrf-secret-key')
    
    # Rate limiting
    app.config['RATELIMIT_ENABLED'] = True
    app.config['RATELIMIT_STORAGE_URL'] = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
    app.config['RATELIMIT_STRATEGY'] = 'fixed-window'
    app.config['RATELIMIT_DEFAULT'] = "200 per day"
    
    # CORS settings
    app.config['CORS_ORIGINS'] = app.config.get('CORS_ORIGINS', ['http://localhost:3000'])
    app.config['CORS_METHODS'] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    app.config['CORS_HEADERS'] = ['Content-Type', 'Authorization']
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True 
from flask import Flask
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from redis import Redis
import logging
from logging.handlers import RotatingFileHandler
import os

from config import Config
from app.extensions import db, migrate, jwt, cors, mail, socketio, limiter, login_manager

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
    limiter.init_app(app)
    
    # Configure Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    # Setup logging
    if not app.debug and not app.testing:
        if app.config['LOG_TO_STDOUT']:
            stream_handler = logging.StreamHandler()
            stream_handler.setLevel(app.config['LOG_LEVEL'])
            formatter = logging.Formatter(app.config['LOG_FORMAT'])
            stream_handler.setFormatter(formatter)
            app.logger.addHandler(stream_handler)
            app.logger.setLevel(app.config['LOG_LEVEL'])
        else:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler(
                app.config['LOG_FILE'], maxBytes=10240, backupCount=10)
            file_handler.setFormatter(logging.Formatter(app.config['LOG_FORMAT']))
            file_handler.setLevel(app.config['LOG_LEVEL'])
            app.logger.addHandler(file_handler)
            app.logger.setLevel(app.config['LOG_LEVEL'])
            app.logger.info('Business Management System startup')

    # Create upload folder if it doesn't exist
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # Register blueprints
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api/v1')

    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.main import bp as main_bp
    app.register_blueprint(main_bp)

    # Import models after app context is created
    with app.app_context():
        from app import models
        
        # Configure Flask-Login user loader
        @login_manager.user_loader
        def load_user(id):
            return models.User.query.get(int(id))

    return app 
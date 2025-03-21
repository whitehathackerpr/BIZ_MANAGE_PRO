from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_socketio import SocketIO
from config import Config

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()
socketio = SocketIO()

login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    
    with app.app_context():
        # Import all models
        from app.models import User, Order, OrderItem, Product, Address
        
        # Create database tables
        db.create_all()
        
        # Register blueprints
        from app.routes.auth import auth_bp
        from app.routes.main import main_bp
        from app.routes.inventory import inventory_bp
        from app.routes.sales import sales_bp
        from app.routes.analytics import analytics_bp
        from app.routes.api import api_bp
        
        app.register_blueprint(auth_bp)
        app.register_blueprint(main_bp)
        app.register_blueprint(inventory_bp)
        app.register_blueprint(sales_bp)
        app.register_blueprint(analytics_bp)
        app.register_blueprint(api_bp, url_prefix='/api')
        
        # Register error handlers
        from app.errors import register_error_handlers
        register_error_handlers(app)
        
        # Initialize WebSocket events
        from app.websocket import init_websocket
        init_websocket(socketio)
        
        @login_manager.user_loader
        def load_user(id):
            return User.query.get(int(id))
        
        return app
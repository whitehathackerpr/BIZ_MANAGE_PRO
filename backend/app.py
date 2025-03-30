from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_restx import Api
from config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
api = Api(
    title='Business Management API',
    version='1.0',
    description='A comprehensive API for managing business operations',
    doc='/api/docs'
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})  # Allow frontend origin
    limiter.init_app(app)
    api.init_app(app)

    # Register blueprints
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    from app.users import bp as users_bp
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')

    from app.branches import bp as branches_bp
    app.register_blueprint(branches_bp, url_prefix='/api/v1/branches')

    from app.products import bp as products_bp
    app.register_blueprint(products_bp, url_prefix='/api/v1/products')

    from app.sales import bp as sales_bp
    app.register_blueprint(sales_bp, url_prefix='/api/v1/sales')

    from app.inventory import bp as inventory_bp
    app.register_blueprint(inventory_bp, url_prefix='/api/v1/inventory')

    from app.employees import bp as employees_bp
    app.register_blueprint(employees_bp, url_prefix='/api/v1/employees')

    from app.reports import bp as reports_bp
    app.register_blueprint(reports_bp, url_prefix='/api/v1/reports')

    from app.integrations import bp as integrations_bp
    app.register_blueprint(integrations_bp, url_prefix='/api/v1/integrations')

    from app.notifications import bp as notifications_bp
    app.register_blueprint(notifications_bp, url_prefix='/api/v1/notifications')

    from app.settings import bp as settings_bp
    app.register_blueprint(settings_bp, url_prefix='/api/v1/settings')

    return app

from app import models 
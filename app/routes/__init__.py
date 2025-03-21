from .main import main_bp
from .products import products_bp
from .settings import settings_bp
from .auth import auth_bp
from .dashboard import dashboard_bp
from .inventory import inventory_bp
from .sales import sales_bp
from .analytics import analytics_bp
from .api import api_bp

__all__ = [
    'main_bp',
    'products_bp',
    'settings_bp',
    'auth_bp',
    'dashboard_bp',
    'inventory_bp',
    'sales_bp',
    'analytics_bp',
    'api_bp'
] 
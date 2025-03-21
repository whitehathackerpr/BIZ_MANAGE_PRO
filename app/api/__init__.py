from flask import Blueprint
from flask_restx import Api
from .auth import api as auth_ns
from .products import api as products_ns
from .sales import api as sales_ns
from .inventory import api as inventory_ns
from .analytics import api as analytics_ns
from .integrations import api as integrations_ns

# Create Blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api/v1')

# Initialize API
api = Api(
    api_bp,
    title='BizManage Pro API',
    version='1.0',
    description='REST API for BizManage Pro system',
    doc='/docs',
    authorizations={
        'apikey': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization'
        }
    }
)

# Register namespaces
api.add_namespace(auth_ns, path='/auth')
api.add_namespace(products_ns, path='/products')
api.add_namespace(sales_ns, path='/sales')
api.add_namespace(inventory_ns, path='/inventory')
api.add_namespace(analytics_ns, path='/analytics')
api.add_namespace(integrations_ns, path='/integrations')
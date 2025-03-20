from flask_restx import Api
from flask import url_for

class CustomAPI(Api):
    @property
    def specs_url(self):
        """Monkey patch for HTTPS"""
        scheme = 'https' if self.is_prod else 'http'
        return url_for(self.endpoint('specs'), _external=True, _scheme=scheme)

authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': 'Add a Bearer token with the format "Bearer {token}"'
    }
}

api = CustomAPI(
    title='BizManage Pro API',
    version='1.0',
    description='API documentation for BizManage Pro system',
    authorizations=authorizations,
    security='Bearer Auth',
    doc='/docs',
    prefix='/api/v1'
)

# Add response models
responses = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error'
}

# Add common response documentation
api.response(400, 'Bad Request', {'message': 'string'})
api.response(401, 'Unauthorized', {'message': 'string'})
api.response(403, 'Forbidden', {'message': 'string'})
api.response(404, 'Not Found', {'message': 'string'})
api.response(500, 'Internal Server Error', {'message': 'string'}) 
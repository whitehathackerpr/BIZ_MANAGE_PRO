from flask import jsonify
from werkzeug.exceptions import HTTPException
from flask_restx import abort

class APIError(Exception):
    """Base API Error class"""
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        rv['status_code'] = self.status_code
        return rv

def handle_api_error(error):
    """Handler for API errors"""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

def handle_validation_error(error):
    """Handler for validation errors"""
    return jsonify({
        'message': 'Validation error',
        'errors': error.messages
    }), 422

def handle_not_found_error(error):
    """Handler for 404 errors"""
    return jsonify({
        'message': str(error) or 'Resource not found'
    }), 404

def setup_error_handlers(app):
    """Register error handlers with Flask app"""
    app.register_error_handler(APIError, handle_api_error)
    app.register_error_handler(404, handle_not_found_error)
    app.register_error_handler(422, handle_validation_error)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors"""
        app.logger.error(f'Unexpected error: {str(error)}')
        return jsonify({
            'message': 'An unexpected error occurred'
        }), 500
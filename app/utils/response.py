from flask import jsonify
from datetime import datetime, date
from decimal import Decimal

class APIResponse:
    """API Response formatter"""
    
    @staticmethod
    def success(data=None, message=None, status_code=200):
        """Format successful response"""
        response = {
            'success': True,
            'status_code': status_code
        }
        
        if message:
            response['message'] = message
        
        if data is not None:
            response['data'] = data
            
        return jsonify(response), status_code

    @staticmethod
    def error(message, status_code=400, errors=None):
        """Format error response"""
        response = {
            'success': False,
            'message': message,
            'status_code': status_code
        }
        
        if errors:
            response['errors'] = errors
            
        return jsonify(response), status_code

def format_data(obj):
    """Format data for JSON response"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, Decimal):
        return float(obj)
    elif hasattr(obj, 'to_dict'):
        return obj.to_dict()
    return obj 
import json
from functools import wraps
from flask import jsonify, request

def validate_json(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            request.get_json()
        except:
            return jsonify({"error": "Invalid JSON"}), 400
        return f(*args, **kwargs)
    return wrapper

def format_response(data, status=200):
    return jsonify({
        'status': 'success',
        'data': data
    }), status

def handle_error(message, status=400):
    return jsonify({
        'status': 'error',
        'message': message
    }), status 
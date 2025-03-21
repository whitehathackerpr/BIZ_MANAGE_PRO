from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0'
    })

@main_bp.route('/api/dashboard')
def dashboard():
    return jsonify({
        'message': 'Dashboard data will be handled by the React frontend'
    }) 
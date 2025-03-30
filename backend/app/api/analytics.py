from flask import jsonify
from . import bp

@bp.route('/analytics', methods=['GET'])
def get_analytics():
    return jsonify({'message': 'Analytics endpoint'}), 200 
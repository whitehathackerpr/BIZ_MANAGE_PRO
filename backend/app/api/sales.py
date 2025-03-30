from flask import jsonify
from . import bp

@bp.route('/sales', methods=['GET'])
def get_sales():
    return jsonify({'message': 'Sales endpoint'}), 200 
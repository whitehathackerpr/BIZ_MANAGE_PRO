from flask import jsonify
from . import bp

@bp.route('/orders', methods=['GET'])
def get_orders():
    return jsonify({'message': 'Orders endpoint'}), 200 
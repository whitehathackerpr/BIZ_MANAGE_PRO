from flask import jsonify
from . import bp

@bp.route('/products', methods=['GET'])
def get_products():
    return jsonify({'message': 'Products endpoint'}), 200 
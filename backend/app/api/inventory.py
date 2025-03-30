from flask import jsonify
from . import bp

@bp.route('/inventory', methods=['GET'])
def get_inventory():
    return jsonify({'message': 'Inventory endpoint'}), 200 
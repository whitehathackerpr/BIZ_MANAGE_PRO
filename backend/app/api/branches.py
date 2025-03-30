from flask import jsonify
from . import bp

@bp.route('/branches', methods=['GET'])
def get_branches():
    return jsonify({'message': 'Branches endpoint'}), 200 
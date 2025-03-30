from flask import jsonify
from app.users import bp

@bp.route('/')
def get_users():
    return jsonify({"message": "Users endpoint"}) 
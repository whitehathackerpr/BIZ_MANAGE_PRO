from flask import Blueprint

settings_bp = Blueprint('settings', __name__)

# Add your routes here
@settings_bp.route('/settings')
def settings():
    return "Settings page"
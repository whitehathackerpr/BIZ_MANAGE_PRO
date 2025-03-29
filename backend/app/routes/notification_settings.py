from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import NotificationSetting
from ..extensions import db

notification_settings_bp = Blueprint('notification_settings', __name__)

@notification_settings_bp.route('/api/notification-settings', methods=['GET'])
@jwt_required()
def get_notification_settings():
    current_user_id = get_jwt_identity()
    settings = NotificationSetting.get_or_create(current_user_id)
    return jsonify(settings.to_dict())

@notification_settings_bp.route('/api/notification-settings', methods=['PUT'])
@jwt_required()
def update_notification_settings():
    current_user_id = get_jwt_identity()
    settings = NotificationSetting.get_or_create(current_user_id)
    data = request.get_json()
    
    # Validate settings data
    if not isinstance(data, dict):
        return jsonify({
            'error': 'Invalid settings data'
        }), 400
    
    # Update settings
    settings.update_from_dict(data)
    db.session.commit()
    
    return jsonify({
        'message': 'Notification settings updated successfully',
        'settings': settings.to_dict()
    })

@notification_settings_bp.route('/api/notification-settings/reset', methods=['POST'])
@jwt_required()
def reset_notification_settings():
    current_user_id = get_jwt_identity()
    settings = NotificationSetting.get_or_create(current_user_id)
    
    # Reset to default values
    settings.email_notifications = True
    settings.push_notifications = True
    settings.in_app_notifications = True
    settings.low_stock_alerts = True
    settings.order_updates = True
    settings.system_alerts = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Notification settings reset to defaults',
        'settings': settings.to_dict()
    }) 
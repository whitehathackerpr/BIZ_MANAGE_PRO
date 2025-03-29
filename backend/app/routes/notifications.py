from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.notification_service import NotificationService
from ..utils.decorators import admin_required

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    
    current_user_id = get_jwt_identity()
    notifications = NotificationService.get_notifications(
        user_id=current_user_id,
        page=page,
        per_page=per_page,
        unread_only=unread_only
    )
    
    return jsonify({
        'notifications': [notification.to_dict() for notification in notifications.items],
        'total': notifications.total,
        'pages': notifications.pages,
        'current_page': notifications.page
    })

@notifications_bp.route('/api/notifications/<int:id>', methods=['GET'])
@jwt_required()
def get_notification(id):
    current_user_id = get_jwt_identity()
    notification = NotificationService.get_notification(id, current_user_id)
    return jsonify(notification.to_dict())

@notifications_bp.route('/api/notifications/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(id):
    current_user_id = get_jwt_identity()
    notification = NotificationService.mark_as_read(id, current_user_id)
    
    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification.to_dict()
    })

@notifications_bp.route('/api/notifications/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    current_user_id = get_jwt_identity()
    count = NotificationService.mark_all_as_read(current_user_id)
    
    return jsonify({
        'message': f'{count} notifications marked as read'
    })

@notifications_bp.route('/api/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    current_user_id = get_jwt_identity()
    count = NotificationService.get_unread_count(current_user_id)
    
    return jsonify({
        'count': count
    })

@notifications_bp.route('/api/notifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_notification(id):
    current_user_id = get_jwt_identity()
    NotificationService.delete_notification(id, current_user_id)
    
    return jsonify({
        'message': 'Notification deleted successfully'
    })

@notifications_bp.route('/api/notifications/clear-all', methods=['DELETE'])
@jwt_required()
def clear_all_notifications():
    current_user_id = get_jwt_identity()
    count = NotificationService.clear_all_notifications(current_user_id)
    
    return jsonify({
        'message': f'{count} notifications cleared successfully'
    })

@notifications_bp.route('/api/notifications/send', methods=['POST'])
@jwt_required()
@admin_required
def send_notification():
    data = request.get_json()
    
    if not data.get('title') or not data.get('message'):
        return jsonify({
            'error': 'Title and message are required'
        }), 400
    
    target_type = data.get('target_type', 'all')
    user_ids = data.get('user_ids', [])
    
    if target_type == 'all':
        notifications = NotificationService.create_system_notification(
            data['title'],
            data['message']
        )
    elif target_type == 'admins':
        notifications = NotificationService.create_admin_notification(
            data['title'],
            data['message']
        )
    elif target_type == 'users' and user_ids:
        notifications = NotificationService.create_bulk_notifications(
            user_ids,
            data['title'],
            data['message']
        )
    else:
        return jsonify({
            'error': 'Invalid target type or missing user IDs'
        }), 400
    
    return jsonify({
        'message': f'{len(notifications)} notifications sent successfully',
        'notifications': [notification.to_dict() for notification in notifications]
    }) 
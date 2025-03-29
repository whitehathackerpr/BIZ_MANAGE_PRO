from datetime import datetime
from ..models import Notification, User
from ..extensions import db

class NotificationService:
    """
    Service for handling user notifications.
    """
    
    @staticmethod
    def get_notifications(user_id, page=1, per_page=20, unread_only=False):
        """
        Get notifications for a user.
        
        Args:
            user_id (int): ID of the user
            page (int): Page number for pagination
            per_page (int): Number of items per page
            unread_only (bool): Whether to show only unread notifications
            
        Returns:
            Pagination: Paginated notifications
        """
        query = Notification.query.filter_by(user_id=user_id)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        return query.order_by(Notification.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def get_notification(notification_id, user_id):
        """
        Get a specific notification.
        
        Args:
            notification_id (int): ID of the notification
            user_id (int): ID of the user
            
        Returns:
            Notification: The notification
        """
        return Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first_or_404()
    
    @staticmethod
    def create_notification(user_id, title, message):
        """
        Create a new notification for a user.
        
        Args:
            user_id (int): ID of the user to notify
            title (str): Notification title
            message (str): Notification message
            
        Returns:
            Notification: Created notification
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            is_read=False
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification
    
    @staticmethod
    def create_bulk_notifications(user_ids, title, message):
        """
        Create notifications for multiple users.
        
        Args:
            user_ids (list): List of user IDs to notify
            title (str): Notification title
            message (str): Notification message
            
        Returns:
            list: List of created notifications
        """
        notifications = []
        
        for user_id in user_ids:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                is_read=False
            )
            notifications.append(notification)
        
        db.session.bulk_save_objects(notifications)
        db.session.commit()
        
        return notifications
    
    @staticmethod
    def create_system_notification(title, message):
        """
        Create a notification for all active users.
        
        Args:
            title (str): Notification title
            message (str): Notification message
            
        Returns:
            list: List of created notifications
        """
        active_users = User.query.filter_by(is_active=True).all()
        user_ids = [user.id for user in active_users]
        
        return NotificationService.create_bulk_notifications(
            user_ids, title, message
        )
    
    @staticmethod
    def create_admin_notification(title, message):
        """
        Create a notification for all administrators.
        
        Args:
            title (str): Notification title
            message (str): Notification message
            
        Returns:
            list: List of created notifications
        """
        admin_users = User.query.filter_by(is_admin=True).all()
        admin_ids = [user.id for user in admin_users]
        
        return NotificationService.create_bulk_notifications(
            admin_ids, title, message
        )
    
    @staticmethod
    def mark_as_read(notification_id, user_id):
        """
        Mark a notification as read.
        
        Args:
            notification_id (int): ID of the notification
            user_id (int): ID of the user
            
        Returns:
            Notification: Updated notification
        """
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first_or_404()
        
        notification.mark_as_read()
        return notification
    
    @staticmethod
    def mark_all_as_read(user_id):
        """
        Mark all notifications as read for a user.
        
        Args:
            user_id (int): ID of the user
            
        Returns:
            int: Number of notifications marked as read
        """
        result = Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        return result
    
    @staticmethod
    def delete_notification(notification_id, user_id):
        """
        Delete a notification.
        
        Args:
            notification_id (int): ID of the notification
            user_id (int): ID of the user
            
        Returns:
            bool: True if deleted, False otherwise
        """
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first_or_404()
        
        db.session.delete(notification)
        db.session.commit()
        return True
    
    @staticmethod
    def clear_all_notifications(user_id):
        """
        Delete all notifications for a user.
        
        Args:
            user_id (int): ID of the user
            
        Returns:
            int: Number of notifications deleted
        """
        result = Notification.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return result
    
    @staticmethod
    def get_unread_count(user_id):
        """
        Get count of unread notifications for a user.
        
        Args:
            user_id (int): ID of the user
            
        Returns:
            int: Number of unread notifications
        """
        return Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).count() 
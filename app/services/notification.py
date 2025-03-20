from flask import current_app, render_template
from app import db, celery
from app.models.notification import Notification, NotificationPreference
from app.models.user import User
from app.services.email import send_email
from app.services.push import send_push_notification
from app.services.sms import send_sms

class NotificationService:
    @staticmethod
    def create_notification(user_id, type, title, message, data=None):
        """Create a new notification and send it through configured channels."""
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            data=data
        )
        db.session.add(notification)
        db.session.commit()
        
        # Send notification through configured channels
        NotificationService.send_notification.delay(notification.id)
        
        return notification
    
    @staticmethod
    @celery.task
    def send_notification(notification_id):
        """Send notification through all enabled channels."""
        notification = Notification.query.get(notification_id)
        if not notification:
            return
        
        preference = NotificationPreference.query.filter_by(
            user_id=notification.user_id,
            type=notification.type
        ).first()
        
        if not preference:
            # Use default preferences
            preference = NotificationPreference(
                user_id=notification.user_id,
                type=notification.type
            )
            db.session.add(preference)
            db.session.commit()
        
        # Send through enabled channels
        if preference.email:
            NotificationService.send_email_notification.delay(notification.id)
        
        if preference.push:
            NotificationService.send_push_notification.delay(notification.id)
        
        if preference.sms:
            NotificationService.send_sms_notification.delay(notification.id)
    
    @staticmethod
    @celery.task
    def send_email_notification(notification_id):
        """Send notification via email."""
        notification = Notification.query.get(notification_id)
        if not notification:
            return
        
        user = notification.user
        template = f'email/notifications/{notification.type}.html'
        
        try:
            html = render_template(template,
                notification=notification,
                user=user
            )
            
            send_email(
                subject=notification.title,
                recipients=[user.email],
                html=html
            )
        except Exception as e:
            current_app.logger.error(f"Failed to send email notification: {str(e)}")
    
    @staticmethod
    @celery.task
    def send_push_notification(notification_id):
        """Send notification via push notification."""
        notification = Notification.query.get(notification_id)
        if not notification:
            return
        
        try:
            send_push_notification(
                user_id=notification.user_id,
                title=notification.title,
                message=notification.message,
                data=notification.data
            )
        except Exception as e:
            current_app.logger.error(f"Failed to send push notification: {str(e)}")
    
    @staticmethod
    @celery.task
    def send_sms_notification(notification_id):
        """Send notification via SMS."""
        notification = Notification.query.get(notification_id)
        if not notification:
            return
        
        user = notification.user
        if not user.phone:
            return
        
        try:
            send_sms(
                phone_number=user.phone,
                message=f"{notification.title}\n\n{notification.message}"
            )
        except Exception as e:
            current_app.logger.error(f"Failed to send SMS notification: {str(e)}")

# Notification helper functions
def notify_order_status(order):
    """Send order status notification."""
    notification_type = f"order_{order.status}"
    title = f"Order {order.order_number} {order.status.title()}"
    message = f"Your order #{order.order_number} has been {order.status}."
    
    NotificationService.create_notification(
        user_id=order.user_id,
        type=notification_type,
        title=title,
        message=message,
        data={'order_id': order.id}
    )

def notify_low_stock(product):
    """Send low stock notification to admins."""
    title = f"Low Stock Alert: {product.name}"
    message = f"Product {product.name} (SKU: {product.sku}) has reached its reorder point."
    
    # Send to all admins
    admin_users = User.query.filter_by(is_admin=True).all()
    for admin in admin_users:
        NotificationService.create_notification(
            user_id=admin.id,
            type='low_stock_alert',
            title=title,
            message=message,
            data={'product_id': product.id}
        )
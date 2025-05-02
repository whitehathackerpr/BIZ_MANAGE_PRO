from app.models import Notification, NotificationSetting
from app.utils.email import send_email
from datetime import datetime

def create_notification(session, user_id, title, message, type='info', send_email_notification=True):
    """
    Create a new notification and optionally send an email.
    
    Args:
        session: SQLAlchemy session
        user_id (int): The ID of the user to notify
        title (str): The notification title
        message (str): The notification message
        type (str): The notification type (warning, info, success)
        send_email_notification (bool): Whether to send an email notification
    """
    try:
        # Create the notification
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        session.add(notification)
        session.commit()

        # Check if email notification is enabled
        if send_email_notification:
            settings = session.query(NotificationSetting).filter_by(user_id=user_id).first()
            if settings:
                # Check if email notifications are enabled for this type
                if type == 'warning' and getattr(settings, 'email_low_stock', False):
                    send_email_notification = True
                elif type == 'success' and getattr(settings, 'email_sales', False):
                    send_email_notification = True
                elif type == 'info' and getattr(settings, 'email_attendance', False):
                    send_email_notification = True
                else:
                    send_email_notification = False

                if send_email_notification:
                    # Get user email from the user model
                    from app.models import User
                    user = session.get(User, user_id)
                    if user and user.email:
                        send_email(
                            subject=f"BizManage Pro: {title}",
                            recipients=[user.email],
                            body=message
                        )

        return notification
    except Exception as e:
        session.rollback()
        raise e

def create_low_stock_notification(session, product):
    """
    Create a low stock notification for a product.
    
    Args:
        session: SQLAlchemy session
        product (Product): The product with low stock
    """
    title = f"Low Stock Alert: {product.name}"
    message = f"Product '{product.name}' (SKU: {product.sku}) is running low on stock. "
    message += f"Current quantity: {product.quantity}, Reorder point: {getattr(product, 'reorder_point', 'N/A')}"
    
    # Get all users with low stock notifications enabled
    settings = session.query(NotificationSetting).filter_by(email_low_stock=True).all()
    for setting in settings:
        create_notification(session, user_id=setting.user_id, title=title, message=message, type='warning')

def create_sales_notification(session, sale):
    """
    Create a sales notification.
    
    Args:
        session: SQLAlchemy session
        sale (Sale): The completed sale
    """
    title = f"New Sale: ${sale.total_amount:.2f}"
    message = f"A new sale of ${sale.total_amount:.2f} was completed by {sale.employee.first_name} {sale.employee.last_name}"
    
    # Get all users with sales notifications enabled
    settings = session.query(NotificationSetting).filter_by(email_sales=True).all()
    for setting in settings:
        create_notification(session, user_id=setting.user_id, title=title, message=message, type='success')

def create_attendance_notification(session, employee, status):
    """
    Create an attendance notification.
    
    Args:
        session: SQLAlchemy session
        employee (Employee): The employee
        status (str): The attendance status (present, absent, late)
    """
    title = f"Attendance Update: {employee.first_name} {employee.last_name}"
    message = f"Employee {employee.first_name} {employee.last_name} is {status} today"
    
    # Get all users with attendance notifications enabled
    settings = session.query(NotificationSetting).filter_by(email_attendance=True).all()
    for setting in settings:
        create_notification(session, user_id=setting.user_id, title=title, message=message, type='info') 
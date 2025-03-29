from app.models import db, Notification, NotificationSetting
from app.utils.email import send_email
from datetime import datetime

def create_notification(user_id, title, message, type='info', send_email_notification=True):
    """
    Create a new notification and optionally send an email.
    
    Args:
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
        db.session.add(notification)
        db.session.commit()

        # Check if email notification is enabled
        if send_email_notification:
            settings = NotificationSetting.query.filter_by(user_id=user_id).first()
            if settings:
                # Check if email notifications are enabled for this type
                if type == 'warning' and settings.email_low_stock:
                    send_email_notification = True
                elif type == 'success' and settings.email_sales:
                    send_email_notification = True
                elif type == 'info' and settings.email_attendance:
                    send_email_notification = True
                else:
                    send_email_notification = False

                if send_email_notification:
                    # Get user email from the user model
                    from app.models import User
                    user = User.query.get(user_id)
                    if user and user.email:
                        send_email(
                            subject=f"BizManage Pro: {title}",
                            recipients=[user.email],
                            body=message
                        )

        return notification
    except Exception as e:
        db.session.rollback()
        raise e

def create_low_stock_notification(product):
    """
    Create a low stock notification for a product.
    
    Args:
        product (Product): The product with low stock
    """
    title = f"Low Stock Alert: {product.name}"
    message = f"Product '{product.name}' (SKU: {product.sku}) is running low on stock. "
    message += f"Current quantity: {product.quantity}, Reorder point: {product.reorder_point}"
    
    # Get all users with low stock notifications enabled
    settings = NotificationSetting.query.filter_by(email_low_stock=True).all()
    for setting in settings:
        create_notification(
            user_id=setting.user_id,
            title=title,
            message=message,
            type='warning'
        )

def create_sales_notification(sale):
    """
    Create a sales notification.
    
    Args:
        sale (Sale): The completed sale
    """
    title = f"New Sale: ${sale.total_amount:.2f}"
    message = f"A new sale of ${sale.total_amount:.2f} was completed by {sale.employee.first_name} {sale.employee.last_name}"
    
    # Get all users with sales notifications enabled
    settings = NotificationSetting.query.filter_by(email_sales=True).all()
    for setting in settings:
        create_notification(
            user_id=setting.user_id,
            title=title,
            message=message,
            type='success'
        )

def create_attendance_notification(employee, status):
    """
    Create an attendance notification.
    
    Args:
        employee (Employee): The employee
        status (str): The attendance status (present, absent, late)
    """
    title = f"Attendance Update: {employee.first_name} {employee.last_name}"
    message = f"Employee {employee.first_name} {employee.last_name} is {status} today"
    
    # Get all users with attendance notifications enabled
    settings = NotificationSetting.query.filter_by(email_attendance=True).all()
    for setting in settings:
        create_notification(
            user_id=setting.user_id,
            title=title,
            message=message,
            type='info'
        ) 
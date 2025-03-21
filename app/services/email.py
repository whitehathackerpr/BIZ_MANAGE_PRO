from flask import current_app, render_template, url_for
from flask_mail import Message
from app import mail, celery
from threading import Thread

def send_async_email(app, msg):
    """Send email asynchronously."""
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            current_app.logger.error(f"Failed to send email: {str(e)}")

@celery.task
def send_email(subject, recipients, html, sender=None, text_body=None):
    """Send email using celery task."""
    try:
        msg = Message(
            subject=subject,
            recipients=recipients,
            html=html,
            body=text_body,
            sender=sender or current_app.config['MAIL_DEFAULT_SENDER']
        )
        
        # Send email asynchronously
        Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        ).start()
        
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        return False

def send_password_reset_email(user, token):
    """Send password reset email."""
    reset_url = url_for('auth.reset_password', token=token, _external=True)
    send_email(
        subject='Reset Your Password',
        recipients=[user.email],
        html=render_template('email/reset_password.html',
            user=user,
            reset_url=reset_url
        )
    )

def send_order_confirmation(order):
    """Send order confirmation email."""
    send_email(
        subject=f'Order Confirmation #{order.order_number}',
        recipients=[order.user.email],
        html=render_template('email/order_confirmation.html',
            order=order,
            user=order.user
        )
    )

def send_shipping_confirmation(order):
    """Send shipping confirmation email."""
    send_email(
        subject=f'Your Order #{order.order_number} Has Shipped',
        recipients=[order.user.email],
        html=render_template('email/shipping_confirmation.html',
            order=order,
            user=order.user
        )
    ) 
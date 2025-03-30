from flask import current_app, render_template
from flask_mail import Message
from app import mail

def send_password_reset_email(user, token):
    """Send a password reset email to a user."""
    msg = Message('Password Reset Request',
                  sender=current_app.config['MAIL_DEFAULT_SENDER'],
                  recipients=[user.email])
    msg.body = render_template('email/reset_password.txt',
                             user=user,
                             token=token)
    msg.html = render_template('email/reset_password.html',
                             user=user,
                             token=token)
    mail.send(msg) 
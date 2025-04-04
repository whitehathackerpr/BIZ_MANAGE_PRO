from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.config import get_settings
from typing import List
import logging

settings = get_settings()

# Configure FastMail
try:
    mail_config = ConnectionConfig(
        MAIL_USERNAME=settings.mail_username,
        MAIL_PASSWORD=settings.mail_password,
        MAIL_FROM=settings.mail_default_sender,
        MAIL_PORT=settings.mail_port,
        MAIL_SERVER=settings.mail_server,
        MAIL_TLS=settings.mail_use_tls,
        MAIL_SSL=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )
    mail = FastMail(mail_config)
except Exception as e:
    logging.error(f"Failed to configure email: {str(e)}")
    mail = None

async def send_password_reset_email(email: str, reset_url: str):
    """Send a password reset email to a user."""
    if not mail:
        logging.warning("Email not configured. Password reset email not sent.")
        return
    
    try:
        # Create message
        message = MessageSchema(
            subject="Password Reset Request",
            recipients=[email],
            body=f"""
            Hello,
            
            We received a request to reset your password.
            
            Click the link below to reset your password:
            {reset_url}
            
            If you did not request a password reset, please ignore this email.
            
            Thanks,
            BIZ_MANAGE_PRO
            """,
            subtype="plain"
        )
        
        # Send email
        await mail.send_message(message)
        logging.info(f"Password reset email sent to {email}")
    except Exception as e:
        logging.error(f"Failed to send password reset email: {str(e)}")
        raise 
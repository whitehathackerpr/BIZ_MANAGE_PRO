from firebase_admin import messaging
from flask import current_app
from app import firebase_app
from app.models import UserDevice
from app import db

def send_push_notification(user_id, title, message, data=None):
    """Send push notification using Firebase Cloud Messaging."""
    try:
        # Get user's FCM tokens
        tokens = UserDevice.query.filter_by(
            user_id=user_id,
            is_active=True
        ).with_entities(UserDevice.fcm_token).all()
        
        if not tokens:
            return False
        
        # Create message
        message = messaging.MulticastMessage(
            tokens=[token[0] for token in tokens],
            notification=messaging.Notification(
                title=title,
                body=message
            ),
            data=data or {}
        )
        
        # Send message
        response = messaging.send_multicast(message)
        
        # Handle failed tokens
        if response.failure_count > 0:
            failures = []
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    failures.append(tokens[idx][0])
            
            # Deactivate failed tokens
            UserDevice.query.filter(
                UserDevice.fcm_token.in_(failures)
            ).update({
                'is_active': False
            }, synchronize_session=False)
            
            db.session.commit()
        
        return response.success_count > 0
    
    except Exception as e:
        current_app.logger.error(f"Failed to send push notification: {str(e)}")
        return False 
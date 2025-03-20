from twilio.rest import Client
from flask import current_app
from app import celery

class SMSService:
    def __init__(self):
        self.client = Client(
            current_app.config['TWILIO_ACCOUNT_SID'],
            current_app.config['TWILIO_AUTH_TOKEN']
        )
        self.from_number = current_app.config['TWILIO_FROM_NUMBER']

    @celery.task
    def send_sms(self, to_number, message):
        """Send SMS using Twilio."""
        try:
            message = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            return message.sid
        except Exception as e:
            current_app.logger.error(f"Failed to send SMS: {str(e)}")
            return None

    def send_order_confirmation(self, order):
        """Send order confirmation SMS."""
        if not order.user.phone:
            return None
        
        message = (
            f"Order Confirmed! "
            f"Your order #{order.order_number} for ${order.total_amount} "
            f"has been received and is being processed. "
            f"Track your order at: {current_app.config['BASE_URL']}/orders/{order.id}"
        )
        
        return self.send_sms.delay(order.user.phone, message)

sms_service = SMSService() 
from flask import current_app
import stripe
from app import db
from app.models.order import Order, Payment

stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

class PaymentService:
    @staticmethod
    def create_payment_intent(order):
        """Create a Stripe payment intent."""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(order.total_amount * 100),  # Convert to cents
                currency='usd',
                customer=order.user.stripe_customer_id,
                metadata={
                    'order_id': order.id,
                    'order_number': order.order_number
                }
            )
            
            # Create payment record
            payment = Payment(
                order_id=order.id,
                amount=order.total_amount,
                payment_method='card',
                transaction_id=intent.id,
                status='pending'
            )
            db.session.add(payment)
            db.session.commit()
            
            return {
                'client_secret': intent.client_secret,
                'payment_id': payment.id
            }
        
        except stripe.error.StripeError as e:
            current_app.logger.error(f"Stripe error: {str(e)}")
            raise PaymentError(str(e))

    @staticmethod
    def process_webhook(event):
        """Process Stripe webhook events."""
        try:
            if event.type == 'payment_intent.succeeded':
                intent = event.data.object
                payment = Payment.query.filter_by(
                    transaction_id=intent.id
                ).first()
                
                if payment:
                    payment.status = 'completed'
                    order = payment.order
                    order.status = 'processing'
                    db.session.commit()
                    
                    # Send notifications
                    from app.services.notification import notify_order_status
                    notify_order_status(order)
            
            elif event.type == 'payment_intent.payment_failed':
                intent = event.data.object
                payment = Payment.query.filter_by(
                    transaction_id=intent.id
                ).first()
                
                if payment:
                    payment.status = 'failed'
                    order = payment.order
                    order.status = 'payment_failed'
                    db.session.commit()
                    
                    # Send notifications
                    from app.services.notification import notify_order_status
                    notify_order_status(order)
            
            return True
        
        except Exception as e:
            current_app.logger.error(f"Webhook processing error: {str(e)}")
            return False

class PaymentError(Exception):
    pass

payment_service = PaymentService() 
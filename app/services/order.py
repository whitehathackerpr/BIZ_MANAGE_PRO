from datetime import datetime
from flask import current_app
from app import db, celery
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.services.notification import NotificationService
from app.services.email import send_email

class OrderService:
    @staticmethod
    def create_order(user, items, shipping_address, billing_address, shipping_method):
        """Create a new order."""
        try:
            order = Order(
                user_id=user.id,
                shipping_address_id=shipping_address.id,
                billing_address_id=billing_address.id,
                shipping_method=shipping_method
            )
            
            total_amount = 0
            for item_data in items:
                product = Product.query.get(item_data['product_id'])
                if not product:
                    raise OrderError("Invalid product")
                
                # Check stock
                if product.stock < item_data['quantity']:
                    raise OrderError(f"Insufficient stock for {product.name}")
                
                # Create order item
                item = OrderItem(
                    product_id=product.id,
                    quantity=item_data['quantity'],
                    price=product.price
                )
                order.items.append(item)
                total_amount += item.price * item.quantity
                
                # Update stock
                product.stock -= item_data['quantity']
                if product.stock <= product.reorder_point:
                    from app.services.notification import notify_low_stock
                    notify_low_stock(product)
            
            # Calculate shipping and tax
            order.shipping_cost = OrderService.calculate_shipping_cost(
                shipping_address,
                order.items
            )
            order.tax_amount = OrderService.calculate_tax(
                total_amount,
                shipping_address
            )
            order.total_amount = total_amount + order.shipping_cost + order.tax_amount
            
            db.session.add(order)
            db.session.commit()
            
            # Process order asynchronously
            OrderService.process_order.delay(order.id)
            
            return order
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Order creation error: {str(e)}")
            raise OrderError(str(e))

    @staticmethod
    @celery.task
    def process_order(order_id):
        """Process order asynchronously."""
        order = Order.query.get(order_id)
        if not order:
            return
        
        try:
            # Send order confirmation
            from app.services.notification import notify_order_status
            notify_order_status(order)
            
            # Send order confirmation email
            from app.services.email import send_order_confirmation
            send_order_confirmation(order)
            
            # Send order confirmation SMS
            from app.services.sms import sms_service
            sms_service.send_order_confirmation(order)
            
            # Update order status
            order.status = 'processing'
            db.session.commit()
            
        except Exception as e:
            current_app.logger.error(f"Order processing error: {str(e)}")
            order.status = 'error'
            db.session.commit()

    @staticmethod
    def calculate_shipping_cost(address, items):
        """Calculate shipping cost based on address and items."""
        # Implement your shipping cost calculation logic here
        base_cost = 5.00
        weight_cost = sum(item.product.weight * item.quantity * 0.1 for item in items)
        return base_cost + weight_cost

    @staticmethod
    def calculate_tax(amount, address):
        """Calculate tax based on amount and address."""
        # Implement your tax calculation logic here
        # This is a simplified example
        tax_rates = {
            'CA': 0.0725,  # California
            'NY': 0.0885,  # New York
            # Add more states/regions as needed
        }
        tax_rate = tax_rates.get(address.state, 0.0)
        return amount * tax_rate

class OrderError(Exception):
    pass

order_service = OrderService() 
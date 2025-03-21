from datetime import datetime, timedelta
from sqlalchemy import func, and_
from app import db
from app.models.order import Order, OrderItem
from app.models.product import Category, Product
from app.models.user import User

class AnalyticsService:
    def get_summary_metrics(self, start_date, end_date):
        """Get summary metrics for dashboard."""
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Total sales
        sales = db.session.query(
            func.sum(Order.total_amount)
        ).filter(
            Order.created_at.between(start_dt, end_dt),
            Order.status != 'cancelled'
        ).scalar() or 0
        
        # Total orders
        orders = Order.query.filter(
            Order.created_at.between(start_dt, end_dt)
        ).count()
        
        # Average order value
        avg_order_value = sales / orders if orders > 0 else 0
        
        # New users
        new_users = User.query.filter(
            User.created_at.between(start_dt, end_dt)
        ).count()
        
        return {
            'total_sales': float(sales),
            'total_orders': orders,
            'avg_order_value': float(avg_order_value),
            'new_users': new_users
        }
    
    def get_sales_trend(self, start_date, end_date, interval='day'):
        """Get sales trend data."""
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        if interval == 'day':
            group_func = func.date(Order.created_at)
        elif interval == 'week':
            group_func = func.date_trunc('week', Order.created_at)
        else:  # month
            group_func = func.date_trunc('month', Order.created_at)
        
        sales_data = db.session.query(
            group_func.label('date'),
            func.sum(Order.total_amount).label('total'),
            func.count(Order.id).label('count')
        ).filter(
            Order.created_at.between(start_dt, end_dt),
            Order.status != 'cancelled'
        ).group_by('date').order_by('date').all()
        
        return [{
            'date': data.date.strftime('%Y-%m-%d'),
            'total': float(data.total),
            'count': data.count
        } for data in sales_data]
    
    def get_top_products(self, start_date, end_date, limit=10):
        """Get top selling products."""
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        top_products = db.session.query(
            Product.id,
            Product.name,
            Product.sku,
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.sum(OrderItem.price * OrderItem.quantity).label('total_sales')
        ).join(
            OrderItem
        ).join(
            Order
        ).filter(
            Order.created_at.between(start_dt, end_dt),
            Order.status != 'cancelled'
        ).group_by(
            Product.id
        ).order_by(
            func.sum(OrderItem.quantity).desc()
        ).limit(limit).all()
        
        return [{
            'id': product.id,
            'name': product.name,
            'sku': product.sku,
            'total_quantity': product.total_quantity,
            'total_sales': float(product.total_sales)
        } for product in top_products]
    
    def get_new_users_trend(self, start_date, end_date, interval='day'):
        """Get new users trend data."""
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        if interval == 'day':
            group_func = func.date(User.created_at)
        elif interval == 'week':
            group_func = func.date_trunc('week', User.created_at)
        else:  # month
            group_func = func.date_trunc('month', User.created_at)
        
        users_data = db.session.query(
            group_func.label('date'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at.between(start_dt, end_dt)
        ).group_by('date').order_by('date').all()
        
        return [{
            'date': data.date.strftime('%Y-%m-%d'),
            'count': data.count
        } for data in users_data]
    
    def get_sales_by_category(self, start_date, end_date):
        """Get sales breakdown by category."""
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        category_sales = db.session.query(
            Category.name,
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.sum(OrderItem.price * OrderItem.quantity).label('total_sales')
        ).join(
            Product, Category.id == Product.category_id
        ).join(
            OrderItem
        ).join(
            Order
        ).filter(
            Order.created_at.between(start_dt, end_dt),
            Order.status != 'cancelled'
        ).group_by(
            Category.name
        ).order_by(
            func.sum(OrderItem.price * OrderItem.quantity).desc()
        ).all()
        
        return [{
            'category': cat.name,
            'total_quantity': cat.total_quantity,
            'total_sales': float(cat.total_sales)
        } for cat in category_sales] 
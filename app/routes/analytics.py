from flask import Blueprint, jsonify
from flask_login import login_required
from app.models import Order, Product, OrderItem
from sqlalchemy import func
from app import db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics')
@login_required
def get_analytics():
    return jsonify({
        'message': 'Analytics data will be handled by the React frontend'
    })

@analytics_bp.route('/api/analytics/sales')
@login_required
def get_sales_analytics():
    # Calculate sales analytics
    total_sales = db.session.query(func.sum(Order.total_amount)).scalar() or 0
    total_orders = Order.query.count()
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    
    return jsonify({
        'total_sales': float(total_sales),
        'total_orders': total_orders,
        'average_order_value': float(avg_order_value)
    })

@analytics_bp.route('/api/analytics/inventory')
@login_required
def get_inventory_analytics():
    # Calculate inventory analytics
    total_products = Product.query.count()
    low_stock_products = Product.query.filter(Product.stock < 10).count()
    out_of_stock_products = Product.query.filter(Product.stock == 0).count()
    
    return jsonify({
        'total_products': total_products,
        'low_stock_products': low_stock_products,
        'out_of_stock_products': out_of_stock_products
    }) 
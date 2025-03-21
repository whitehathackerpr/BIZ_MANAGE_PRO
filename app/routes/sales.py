from flask import Blueprint, request, jsonify
from flask_login import login_required
from app.models import Order, OrderItem
from app import db

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/api/sales')
@login_required
def get_sales():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders])

@sales_bp.route('/api/sales/orders')
@login_required
def get_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders])

@sales_bp.route('/api/sales/analytics')
@login_required
def get_sales_analytics():
    # Calculate sales analytics
    total_sales = sum(order.total_amount for order in Order.query.all())
    total_orders = Order.query.count()
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    
    return jsonify({
        'total_sales': float(total_sales),
        'total_orders': total_orders,
        'average_order_value': float(avg_order_value)
    })

@sales_bp.route('/api/sales/update-status', methods=['POST'])
@login_required
def update_order_status():
    data = request.get_json()
    order_id = data.get('order_id')
    new_status = data.get('status')
    
    if not order_id or not new_status:
        return jsonify({'error': 'Missing required fields'}), 400
    
    order = Order.query.get_or_404(order_id)
    order.status = new_status
    db.session.commit()
    
    return jsonify({
        'message': 'Order status updated successfully',
        'order': order.to_dict()
    }) 
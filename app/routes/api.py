from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.models import Product, Order, User
from app import db

api_bp = Blueprint('api', __name__)

@api_bp.route('/products')
@login_required
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@api_bp.route('/products/<int:product_id>')
@login_required
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())

@api_bp.route('/orders')
@login_required
def get_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders])

@api_bp.route('/orders/<int:order_id>')
@login_required
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict())

@api_bp.route('/users')
@login_required
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
        'is_admin': user.is_admin
    } for user in users])

@api_bp.route('/users/<int:user_id>')
@login_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
        'is_admin': user.is_admin
    }) 
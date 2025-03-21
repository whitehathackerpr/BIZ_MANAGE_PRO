from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required
from app.models import Product, ProductVariant
from app import db

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/api/inventory')
@login_required
def get_inventory():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@inventory_bp.route('/api/inventory/products')
@login_required
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@inventory_bp.route('/api/inventory/stock')
@login_required
def get_stock():
    products = Product.query.all()
    return jsonify([{
        'id': product.id,
        'name': product.name,
        'stock': product.stock,
        'status': product.stock_status
    } for product in products])

@inventory_bp.route('/api/inventory/update-stock', methods=['POST'])
@login_required
def update_stock():
    data = request.get_json()
    product_id = data.get('product_id')
    new_stock = data.get('stock')
    
    if not product_id or new_stock is None:
        return jsonify({'error': 'Missing required fields'}), 400
    
    product = Product.query.get_or_404(product_id)
    product.stock = new_stock
    db.session.commit()
    
    return jsonify({
        'message': 'Stock updated successfully',
        'product': product.to_dict()
    }) 
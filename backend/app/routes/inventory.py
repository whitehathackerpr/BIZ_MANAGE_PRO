from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, or_
from datetime import datetime
from ..models import Product, Category, ProductVariant, Supplier, Transaction
from ..extensions import db
from ..utils.decorators import admin_required
from ..utils.validation import validate_inventory_data

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/api/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', '')
    stock_status = request.args.get('stock_status')  # low, out, in_stock
    supplier_id = request.args.get('supplier_id', type=int)
    
    query = Product.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    if stock_status:
        if stock_status == 'low':
            query = query.filter(Product.stock <= Product.min_stock_level)
        elif stock_status == 'out':
            query = query.filter(Product.stock == 0)
        elif stock_status == 'in_stock':
            query = query.filter(Product.stock > 0)
    if supplier_id:
        query = query.filter_by(supplier_id=supplier_id)
    
    products = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': products.page
    })

@inventory_bp.route('/api/inventory/adjust', methods=['POST'])
@jwt_required()
@admin_required
def adjust_inventory():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate inventory data
    errors = validate_inventory_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    product = Product.query.get_or_404(data['product_id'])
    adjustment_type = data['type']  # add, remove
    quantity = data['quantity']
    reason = data.get('reason')
    
    if adjustment_type == 'remove' and product.stock < quantity:
        return jsonify({
            'error': f'Insufficient stock for product {product.name}'
        }), 400
    
    # Update stock
    if adjustment_type == 'add':
        product.stock += quantity
    else:
        product.stock -= quantity
    
    # Create transaction record
    transaction = Transaction(
        type='expense' if adjustment_type == 'add' else 'income',
        amount=product.price * quantity,
        description=f'Inventory adjustment: {adjustment_type} {quantity} units of {product.name}',
        category='inventory',
        reference_number=f'INV-{datetime.utcnow().strftime("%Y%m%d%H%M")}',
        date=datetime.utcnow(),
        notes=reason
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Inventory adjusted successfully',
        'product': product.to_dict()
    })

@inventory_bp.route('/api/inventory/transfer', methods=['POST'])
@jwt_required()
@admin_required
def transfer_inventory():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate transfer data
    errors = validate_inventory_data(data, transfer=True)
    if errors:
        return jsonify({'errors': errors}), 400
    
    source_product = Product.query.get_or_404(data['source_product_id'])
    target_product = Product.query.get_or_404(data['target_product_id'])
    quantity = data['quantity']
    reason = data.get('reason')
    
    if source_product.stock < quantity:
        return jsonify({
            'error': f'Insufficient stock for product {source_product.name}'
        }), 400
    
    # Update stock
    source_product.stock -= quantity
    target_product.stock += quantity
    
    # Create transaction records
    source_transaction = Transaction(
        type='expense',
        amount=source_product.price * quantity,
        description=f'Inventory transfer: {quantity} units from {source_product.name} to {target_product.name}',
        category='inventory',
        reference_number=f'TRF-{datetime.utcnow().strftime("%Y%m%d%H%M")}',
        date=datetime.utcnow(),
        notes=reason
    )
    
    target_transaction = Transaction(
        type='income',
        amount=target_product.price * quantity,
        description=f'Inventory transfer: {quantity} units from {source_product.name} to {target_product.name}',
        category='inventory',
        reference_number=f'TRF-{datetime.utcnow().strftime("%Y%m%d%H%M")}',
        date=datetime.utcnow(),
        notes=reason
    )
    
    db.session.add(source_transaction)
    db.session.add(target_transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Inventory transferred successfully',
        'source_product': source_product.to_dict(),
        'target_product': target_product.to_dict()
    })

@inventory_bp.route('/api/inventory/stock-levels')
@jwt_required()
def get_stock_levels():
    # Get low stock products
    low_stock = Product.query.filter(
        Product.stock <= Product.min_stock_level
    ).order_by(Product.stock.asc()).all()
    
    # Get out of stock products
    out_of_stock = Product.query.filter(
        Product.stock == 0
    ).order_by(Product.name.asc()).all()
    
    # Get stock value by category
    stock_value_by_category = db.session.query(
        Category.name,
        func.sum(Product.stock * Product.price).label('total_value')
    ).join(
        Product, Category.id == Product.category_id
    ).group_by(
        Category.id, Category.name
    ).all()
    
    # Get total inventory value
    total_value = db.session.query(
        func.sum(Product.stock * Product.price)
    ).scalar() or 0
    
    return jsonify({
        'low_stock': [product.to_dict() for product in low_stock],
        'out_of_stock': [product.to_dict() for product in out_of_stock],
        'stock_value_by_category': [{
            'category': category.name,
            'total_value': float(category.total_value)
        } for category in stock_value_by_category],
        'total_inventory_value': float(total_value)
    })

@inventory_bp.route('/api/inventory/stock-history')
@jwt_required()
def get_stock_history():
    product_id = request.args.get('product_id', type=int)
    start_date = request.args.get('start_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
    end_date = request.args.get('end_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
    
    query = Transaction.query.filter_by(category='inventory')
    
    if product_id:
        query = query.filter(
            Transaction.description.ilike(f'%{product_id}%')
        )
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    history = query.order_by(Transaction.date.desc()).all()
    
    return jsonify({
        'history': [transaction.to_dict() for transaction in history]
    })

@inventory_bp.route('/api/inventory/supplier-stock')
@jwt_required()
def get_supplier_stock():
    supplier_id = request.args.get('supplier_id', type=int)
    
    query = Product.query
    
    if supplier_id:
        query = query.filter_by(supplier_id=supplier_id)
    
    products = query.all()
    
    # Group products by supplier
    supplier_stock = {}
    for product in products:
        if product.supplier_id not in supplier_stock:
            supplier_stock[product.supplier_id] = {
                'supplier': product.supplier.to_dict() if product.supplier else None,
                'products': [],
                'total_value': 0
            }
        
        supplier_stock[product.supplier_id]['products'].append(product.to_dict())
        supplier_stock[product.supplier_id]['total_value'] += product.stock * product.price
    
    return jsonify({
        'supplier_stock': list(supplier_stock.values())
    }) 
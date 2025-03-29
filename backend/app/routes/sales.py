from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import datetime, timedelta
from ..models import Sale, SaleItem, Order, OrderItem, Product, Transaction
from ..extensions import db
from ..utils.decorators import admin_required
from ..utils.validation import validate_sale_data

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('/api/sales', methods=['GET'])
@jwt_required()
def get_sales():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    start_date = request.args.get('start_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
    end_date = request.args.get('end_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
    status = request.args.get('status')
    
    query = Sale.query
    
    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)
    if status:
        query = query.filter_by(payment_status=status)
    
    sales = query.order_by(Sale.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'sales': [sale.to_dict() for sale in sales.items],
        'total': sales.total,
        'pages': sales.pages,
        'current_page': sales.page
    })

@sales_bp.route('/api/sales', methods=['POST'])
@jwt_required()
def create_sale():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate sale data
    errors = validate_sale_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Create sale
    sale = Sale(
        user_id=current_user_id,
        customer_name=data['customer_name'],
        customer_email=data.get('customer_email'),
        customer_phone=data.get('customer_phone'),
        payment_method=data.get('payment_method', 'cash'),
        payment_status='completed' if data.get('payment_method') == 'cash' else 'pending',
        notes=data.get('notes')
    )
    
    # Add sale items
    total_amount = 0
    for item_data in data['items']:
        product = Product.query.get_or_404(item_data['product_id'])
        if product.stock < item_data['quantity']:
            return jsonify({
                'error': f'Insufficient stock for product {product.name}'
            }), 400
        
        sale_item = SaleItem(
            sale=sale,
            product=product,
            variant_id=item_data.get('variant_id'),
            quantity=item_data['quantity'],
            price=product.price,
            discount=item_data.get('discount', 0),
            notes=item_data.get('notes')
        )
        
        # Update product stock
        product.stock -= item_data['quantity']
        
        sale.items.append(sale_item)
        total_amount += sale_item.subtotal
    
    sale.total_amount = total_amount
    sale.subtotal = total_amount
    
    # Create transaction record
    if data.get('payment_method') == 'cash':
        transaction = Transaction(
            type='income',
            amount=total_amount,
            description=f'Sale #{sale.id}',
            date=datetime.utcnow(),
            sale_id=sale.id
        )
        db.session.add(transaction)
    
    db.session.add(sale)
    db.session.commit()
    
    return jsonify({
        'message': 'Sale created successfully',
        'sale': sale.to_dict()
    }), 201

@sales_bp.route('/api/sales/<int:id>', methods=['GET'])
@jwt_required()
def get_sale(id):
    sale = Sale.query.get_or_404(id)
    return jsonify(sale.to_dict())

@sales_bp.route('/api/sales/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_sale(id):
    sale = Sale.query.get_or_404(id)
    data = request.get_json()
    
    # Validate sale data
    errors = validate_sale_data(data, partial=True)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Update sale fields
    if 'customer_name' in data:
        sale.customer_name = data['customer_name']
    if 'customer_email' in data:
        sale.customer_email = data['customer_email']
    if 'customer_phone' in data:
        sale.customer_phone = data['customer_phone']
    if 'payment_method' in data:
        sale.payment_method = data['payment_method']
    if 'payment_status' in data:
        sale.payment_status = data['payment_status']
    if 'notes' in data:
        sale.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Sale updated successfully',
        'sale': sale.to_dict()
    })

@sales_bp.route('/api/sales/<int:id>/items', methods=['POST'])
@jwt_required()
@admin_required
def add_sale_item(id):
    sale = Sale.query.get_or_404(id)
    data = request.get_json()
    
    product = Product.query.get_or_404(data['product_id'])
    if product.stock < data['quantity']:
        return jsonify({
            'error': f'Insufficient stock for product {product.name}'
        }), 400
    
    sale_item = SaleItem(
        sale=sale,
        product=product,
        variant_id=data.get('variant_id'),
        quantity=data['quantity'],
        price=product.price,
        discount=data.get('discount', 0),
        notes=data.get('notes')
    )
    
    # Update product stock
    product.stock -= data['quantity']
    
    sale.items.append(sale_item)
    sale.calculate_totals()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item added successfully',
        'sale_item': sale_item.to_dict()
    })

@sales_bp.route('/api/sales/<int:id>/items/<int:item_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_sale_item(id, item_id):
    sale = Sale.query.get_or_404(id)
    sale_item = SaleItem.query.get_or_404(item_id)
    
    if sale_item.sale_id != sale.id:
        return jsonify({
            'error': 'Item does not belong to this sale'
        }), 400
    
    data = request.get_json()
    
    # Restore previous stock
    sale_item.product.stock += sale_item.quantity
    
    # Update item
    if 'quantity' in data:
        if sale_item.product.stock < data['quantity']:
            return jsonify({
                'error': f'Insufficient stock for product {sale_item.product.name}'
            }), 400
        sale_item.quantity = data['quantity']
        sale_item.product.stock -= data['quantity']
    
    if 'price' in data:
        sale_item.price = data['price']
    if 'discount' in data:
        sale_item.discount = data['discount']
    if 'notes' in data:
        sale_item.notes = data['notes']
    
    sale.calculate_totals()
    db.session.commit()
    
    return jsonify({
        'message': 'Item updated successfully',
        'sale_item': sale_item.to_dict()
    })

@sales_bp.route('/api/sales/<int:id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_sale_item(id, item_id):
    sale = Sale.query.get_or_404(id)
    sale_item = SaleItem.query.get_or_404(item_id)
    
    if sale_item.sale_id != sale.id:
        return jsonify({
            'error': 'Item does not belong to this sale'
        }), 400
    
    # Restore product stock
    sale_item.product.stock += sale_item.quantity
    
    db.session.delete(sale_item)
    sale.calculate_totals()
    db.session.commit()
    
    return jsonify({
        'message': 'Item deleted successfully'
    })

@sales_bp.route('/api/sales/analytics')
@jwt_required()
def get_sales_analytics():
    # Get date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    # Calculate total sales
    total_sales = db.session.query(func.sum(Sale.total_amount)).filter(
        Sale.created_at.between(start_date, end_date)
    ).scalar() or 0
    
    # Calculate total orders
    total_orders = Sale.query.filter(
        Sale.created_at.between(start_date, end_date)
    ).count()
    
    # Calculate average order value
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    
    # Get daily sales
    daily_sales = db.session.query(
        func.date(Sale.created_at).label('date'),
        func.count(Sale.id).label('orders'),
        func.sum(Sale.total_amount).label('total')
    ).filter(
        Sale.created_at.between(start_date, end_date)
    ).group_by(
        func.date(Sale.created_at)
    ).all()
    
    # Get top products
    top_products = db.session.query(
        Product.name,
        func.sum(SaleItem.quantity).label('total_quantity'),
        func.sum(SaleItem.quantity * SaleItem.price).label('total_revenue')
    ).join(
        SaleItem, Product.id == SaleItem.product_id
    ).join(
        Sale, SaleItem.sale_id == Sale.id
    ).filter(
        Sale.created_at.between(start_date, end_date)
    ).group_by(
        Product.id, Product.name
    ).order_by(
        func.sum(SaleItem.quantity * SaleItem.price).desc()
    ).limit(10).all()
    
    return jsonify({
        'total_sales': float(total_sales),
        'total_orders': total_orders,
        'average_order_value': float(avg_order_value),
        'daily_sales': [{
            'date': str(sale.date),
            'orders': sale.orders,
            'total': float(sale.total)
        } for sale in daily_sales],
        'top_products': [{
            'name': product.name,
            'total_quantity': int(product.total_quantity),
            'total_revenue': float(product.total_revenue)
        } for product in top_products]
    }) 
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from app.models import (
    User, Product, Supplier, Employee, Attendance, Sale,
    SaleItem, Expense, InventoryTransaction, Notification
)
from app import db

api = Blueprint('api', __name__)

# Authentication Routes
@api.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and check_password_hash(user.password_hash, data.get('password')):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@api.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        password_hash=generate_password_hash(data.get('password')),
        role=data.get('role', 'user')
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

# Product Routes
@api.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'sku': p.sku,
        'barcode': p.barcode,
        'category': p.category,
        'price': p.price,
        'cost_price': p.cost_price,
        'quantity': p.quantity,
        'min_quantity': p.min_quantity,
        'max_quantity': p.max_quantity,
        'location': p.location,
        'supplier': p.supplier.name if p.supplier else None
    } for p in products]), 200

@api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json()
    product = Product(**data)
    db.session.add(product)
    db.session.commit()
    return jsonify({'message': 'Product created successfully', 'id': product.id}), 201

@api.route('/products/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
        setattr(product, key, value)
    db.session.commit()
    return jsonify({'message': 'Product updated successfully'}), 200

# Sales Routes
@api.route('/sales', methods=['GET'])
@jwt_required()
def get_sales():
    sales = Sale.query.all()
    return jsonify([{
        'id': s.id,
        'invoice_number': s.invoice_number,
        'customer_name': s.customer_name,
        'total_amount': s.total_amount,
        'discount': s.discount,
        'tax': s.tax,
        'payment_method': s.payment_method,
        'status': s.status,
        'created_at': s.created_at.isoformat(),
        'employee': f"{s.employee.first_name} {s.employee.last_name}" if s.employee else None,
        'items': [{
            'product_name': item.product.name,
            'quantity': item.quantity,
            'unit_price': item.unit_price,
            'total_price': item.total_price
        } for item in s.items]
    } for s in sales]), 200

@api.route('/sales', methods=['POST'])
@jwt_required()
def create_sale():
    data = request.get_json()
    sale = Sale(
        invoice_number=data.get('invoice_number'),
        customer_name=data.get('customer_name'),
        total_amount=data.get('total_amount'),
        discount=data.get('discount', 0),
        tax=data.get('tax', 0),
        payment_method=data.get('payment_method'),
        employee_id=data.get('employee_id')
    )
    db.session.add(sale)
    
    for item_data in data.get('items', []):
        item = SaleItem(
            sale=sale,
            product_id=item_data.get('product_id'),
            quantity=item_data.get('quantity'),
            unit_price=item_data.get('unit_price'),
            total_price=item_data.get('total_price')
        )
        db.session.add(item)
        
        # Update product quantity
        product = Product.query.get(item_data.get('product_id'))
        if product:
            product.quantity -= item_data.get('quantity')
    
    db.session.commit()
    return jsonify({'message': 'Sale recorded successfully', 'id': sale.id}), 201

# Employee Routes
@api.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        'id': e.id,
        'first_name': e.first_name,
        'last_name': e.last_name,
        'email': e.email,
        'phone': e.phone,
        'role': e.role,
        'department': e.department,
        'hire_date': e.hire_date.isoformat() if e.hire_date else None,
        'salary': e.salary,
        'is_active': e.is_active
    } for e in employees]), 200

@api.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    data = request.get_json()
    employee = Employee(**data)
    db.session.add(employee)
    db.session.commit()
    return jsonify({'message': 'Employee created successfully', 'id': employee.id}), 201

# Attendance Routes
@api.route('/attendance/check-in', methods=['POST'])
@jwt_required()
def check_in():
    data = request.get_json()
    attendance = Attendance(
        employee_id=data.get('employee_id'),
        date=datetime.now().date(),
        check_in=datetime.now(),
        status='present'
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'message': 'Check-in recorded successfully'}), 201

@api.route('/attendance/check-out', methods=['POST'])
@jwt_required()
def check_out():
    data = request.get_json()
    attendance = Attendance.query.filter_by(
        employee_id=data.get('employee_id'),
        date=datetime.now().date()
    ).first()
    
    if attendance:
        attendance.check_out = datetime.now()
        db.session.commit()
        return jsonify({'message': 'Check-out recorded successfully'}), 200
    return jsonify({'message': 'No active check-in found'}), 404

# Analytics Routes
@api.route('/analytics/sales', methods=['GET'])
@jwt_required()
def get_sales_analytics():
    # Get date range from query parameters
    start_date = request.args.get('start_date', (datetime.now() - timedelta(days=30)).isoformat())
    end_date = request.args.get('end_date', datetime.now().isoformat())
    
    sales = Sale.query.filter(
        Sale.created_at.between(start_date, end_date)
    ).all()
    
    total_sales = sum(s.total_amount for s in sales)
    total_items = sum(item.quantity for s in sales for item in s.items)
    
    return jsonify({
        'total_sales': total_sales,
        'total_items': total_items,
        'sales_count': len(sales),
        'period': {
            'start': start_date,
            'end': end_date
        }
    }), 200

@api.route('/analytics/inventory', methods=['GET'])
@jwt_required()
def get_inventory_analytics():
    low_stock = Product.query.filter(
        Product.quantity <= Product.min_quantity
    ).all()
    
    out_of_stock = Product.query.filter(
        Product.quantity == 0
    ).all()
    
    return jsonify({
        'low_stock_count': len(low_stock),
        'out_of_stock_count': len(out_of_stock),
        'low_stock_items': [{
            'id': p.id,
            'name': p.name,
            'quantity': p.quantity,
            'min_quantity': p.min_quantity
        } for p in low_stock],
        'out_of_stock_items': [{
            'id': p.id,
            'name': p.name
        } for p in out_of_stock]
    }), 200

# Notification Routes
@api.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).order_by(Notification.created_at.desc()).all()
    
    return jsonify([{
        'id': n.id,
        'title': n.title,
        'message': n.message,
        'type': n.type,
        'created_at': n.created_at.isoformat()
    } for n in notifications]), 200

@api.route('/notifications/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(id):
    notification = Notification.query.get_or_404(id)
    notification.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'}), 200 
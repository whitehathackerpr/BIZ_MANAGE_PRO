from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.order import Order, OrderItem, Address, Payment
from app.models.product import Product, ProductVariant
from app.forms.order import OrderForm, AddressForm
from app.services.notification import send_order_notification
from app.utils.decorators import admin_required

orders_bp = Blueprint('orders', __name__)

def calculate_shipping_cost(address, total_weight):
    # Basic shipping cost calculation
    base_rate = 10.00  # Base shipping rate
    weight_rate = 0.50  # Cost per kg
    
    return base_rate + (total_weight * weight_rate)

def get_available_shipping_methods(address):
    # Placeholder for shipping methods
    return [
        {'id': 'standard', 'name': 'Standard Shipping', 'price': 10.00},
        {'id': 'express', 'name': 'Express Shipping', 'price': 25.00}
    ]

@orders_bp.route('/orders')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status')
    search = request.args.get('search', '')
    
    query = Order.query
    
    if not current_user.is_admin:
        query = query.filter_by(user_id=current_user.id)
    
    if status:
        query = query.filter_by(status=status)
    if search:
        query = query.filter(Order.order_number.ilike(f'%{search}%'))
    
    orders = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('orders/index.html', orders=orders)

@orders_bp.route('/orders/create', methods=['GET', 'POST'])
@login_required
def create():
    form = OrderForm()
    
    if form.validate_on_submit():
        # Create new order
        order = Order(
            user_id=current_user.id,
            shipping_method=form.shipping_method.data,
            shipping_cost=form.shipping_cost.data,
            notes=form.notes.data
        )
        
        # Add order items
        for item_data in form.items.data:
            product = Product.query.get(item_data['product_id'])
            variant = ProductVariant.query.get(item_data.get('variant_id'))
            
            if not product or (item_data.get('variant_id') and not variant):
                flash('One or more products are invalid', 'error')
                return redirect(url_for('orders.create'))
            
            # Check stock availability
            if variant:
                if variant.stock < item_data['quantity']:
                    flash(f'Insufficient stock for variant {variant.name}', 'error')
                    return redirect(url_for('orders.create'))
                variant.stock -= item_data['quantity']
            else:
                if product.stock < item_data['quantity']:
                    flash(f'Insufficient stock for product {product.name}', 'error')
                    return redirect(url_for('orders.create'))
                product.stock -= item_data['quantity']
            
            item = OrderItem(
                product=product,
                variant=variant,
                quantity=item_data['quantity'],
                price=variant.price if variant else product.price
            )
            order.items.append(item)
        
        # Set addresses
        shipping_address = Address.query.get(form.shipping_address_id.data)
        billing_address = Address.query.get(form.billing_address_id.data)
        order.shipping_address = shipping_address
        order.billing_address = billing_address
        
        # Calculate totals
        order.calculate_totals()
        
        db.session.add(order)
        db.session.commit()
        
        # Send notifications
        send_order_notification(order)
        
        flash('Order created successfully', 'success')
        return redirect(url_for('orders.view', id=order.id))
    
    return render_template('orders/create.html', form=form)

@orders_bp.route('/orders/<int:id>')
@login_required
def view(id):
    order = Order.query.get_or_404(id)
    if not current_user.is_admin and order.user_id != current_user.id:
        flash('You do not have permission to view this order', 'error')
        return redirect(url_for('orders.index'))
    
    return render_template('orders/view.html', order=order)

@orders_bp.route('/orders/<int:id>/update-status', methods=['POST'])
@login_required
@admin_required
def update_status(id):
    order = Order.query.get_or_404(id)
    new_status = request.form.get('status')
    
    if new_status not in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        return jsonify({'error': 'Invalid status'}), 400
    
    order.status = new_status
    db.session.commit()
    
    # Send notification
    send_order_notification(order, 'status_update')
    
    return jsonify({'message': 'Status updated successfully'})

@orders_bp.route('/api/orders/calculate-shipping', methods=['POST'])
@login_required
def calculate_shipping():
    data = request.get_json()
    address_id = data.get('address_id')
    items = data.get('items', [])
    
    if not address_id or not items:
        return jsonify({'error': 'Missing required data'}), 400
    
    address = Address.query.get_or_404(address_id)
    
    # Calculate shipping cost based on address and items
    # This is a simplified example - implement your own shipping calculation logic
    total_weight = sum(
        Product.query.get(item['product_id']).weight * item['quantity']
        for item in items
    )
    
    shipping_cost = calculate_shipping_cost(address, total_weight)
    
    return jsonify({
        'shipping_cost': shipping_cost,
        'shipping_methods': get_available_shipping_methods(address)
    }) 
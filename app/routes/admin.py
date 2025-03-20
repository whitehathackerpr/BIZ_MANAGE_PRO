from flask import Blueprint, render_template, jsonify, request
from flask_login import login_required
from app.utils.decorators import admin_required
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.services.analytics import AnalyticsService
from app.extensions import db
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin')
@login_required
@admin_required
def dashboard():
    # Get date range from query parameters or default to last 30 days
    end_date = datetime.utcnow()
    start_date = request.args.get('start_date', 
        (end_date - timedelta(days=30)).strftime('%Y-%m-%d'))
    end_date = request.args.get('end_date', end_date.strftime('%Y-%m-%d'))
    
    # Get analytics data
    analytics = AnalyticsService()
    
    dashboard_data = {
        'summary': analytics.get_summary_metrics(start_date, end_date),
        'sales_trend': analytics.get_sales_trend(start_date, end_date),
        'top_products': analytics.get_top_products(start_date, end_date),
        'recent_orders': Order.query.order_by(Order.created_at.desc()).limit(5).all(),
        'low_stock_products': Product.query.filter(
            Product.stock <= Product.reorder_point
        ).all(),
        'new_users': analytics.get_new_users_trend(start_date, end_date)
    }
    
    return render_template('admin/dashboard.html', data=dashboard_data)

@admin_bp.route('/admin/orders')
@login_required
@admin_required
def orders():
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status')
    search = request.args.get('search', '')
    
    query = Order.query
    
    if status:
        query = query.filter_by(status=status)
    if search:
        query = query.filter(Order.order_number.ilike(f'%{search}%'))
    
    orders = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/orders.html', orders=orders)

@admin_bp.route('/admin/products')
@login_required
@admin_required
def products():
    page = request.args.get('page', 1, type=int)
    category = request.args.get('category')
    search = request.args.get('search', '')
    
    query = Product.query
    
    if category:
        query = query.filter_by(category_id=category)
    if search:
        query = query.filter(
            db.or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%')
            )
        )
    
    products = query.order_by(Product.name).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/products.html', products=products)

@admin_bp.route('/admin/users')
@login_required
@admin_required
def users():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    
    query = User.query
    
    if search:
        query = query.filter(
            db.or_(
                User.email.ilike(f'%{search}%'),
                User.username.ilike(f'%{search}%')
            )
        )
    
    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/users.html', users=users)

@admin_bp.route('/admin/analytics')
@login_required
@admin_required
def analytics():
    return render_template('admin/analytics.html')

@admin_bp.route('/api/admin/analytics/sales')
@login_required
@admin_required
def sales_analytics():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    group_by = request.args.get('group_by', 'day')
    
    analytics = AnalyticsService()
    data = analytics.get_sales_analytics(start_date, end_date, group_by)
    
    return jsonify(data) 
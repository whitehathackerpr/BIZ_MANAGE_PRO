from flask import jsonify, request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from . import bp
from ..models import Sale, Product, InventoryTransaction, Customer
from ..crud.analytics import analytics_crud
from ..dependencies import get_db, get_current_user
from ..core.exceptions import NotFoundException

@bp.route('/analytics', methods=['GET'])
def get_analytics():
    return jsonify({'message': 'Analytics endpoint'}), 200 

@bp.route('/analytics/sales', methods=['GET'])
def get_sales_analytics():
    """Get sales analytics data"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    period: str = request.args.get('period', 'daily')  # daily, weekly, monthly, yearly
    start_date: Optional[str] = request.args.get('start_date')
    end_date: Optional[str] = request.args.get('end_date')
    
    # Convert string dates to datetime if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    analytics = analytics_crud.get_sales_analytics(
        db,
        branch_id=branch_id,
        period=period,
        start_date=start_dt,
        end_date=end_dt
    )
    return jsonify(analytics)

@bp.route('/analytics/inventory', methods=['GET'])
def get_inventory_analytics():
    """Get inventory analytics data"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    category: Optional[str] = request.args.get('category')
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    analytics = analytics_crud.get_inventory_analytics(
        db,
        branch_id=branch_id,
        category=category
    )
    return jsonify(analytics)

@bp.route('/analytics/customers', methods=['GET'])
def get_customer_analytics():
    """Get customer analytics data"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    period: str = request.args.get('period', 'monthly')  # daily, weekly, monthly, yearly
    start_date: Optional[str] = request.args.get('start_date')
    end_date: Optional[str] = request.args.get('end_date')
    
    # Convert string dates to datetime if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    analytics = analytics_crud.get_customer_analytics(
        db,
        period=period,
        start_date=start_dt,
        end_date=end_dt
    )
    return jsonify(analytics)

@bp.route('/analytics/revenue', methods=['GET'])
def get_revenue_analytics():
    """Get revenue analytics data"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    period: str = request.args.get('period', 'monthly')  # daily, weekly, monthly, yearly
    start_date: Optional[str] = request.args.get('start_date')
    end_date: Optional[str] = request.args.get('end_date')
    
    # Convert string dates to datetime if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    analytics = analytics_crud.get_revenue_analytics(
        db,
        branch_id=branch_id,
        period=period,
        start_date=start_dt,
        end_date=end_dt
    )
    return jsonify(analytics)

@bp.route('/analytics/products', methods=['GET'])
def get_product_analytics():
    """Get product analytics data"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    category: Optional[str] = request.args.get('category')
    period: str = request.args.get('period', 'monthly')  # daily, weekly, monthly, yearly
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    analytics = analytics_crud.get_product_analytics(
        db,
        branch_id=branch_id,
        category=category,
        period=period
    )
    return jsonify(analytics)

@bp.route('/analytics/forecasts', methods=['GET'])
def get_forecasts():
    """Get sales and inventory forecasts"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    forecast_type: str = request.args.get('type', 'sales')  # sales, inventory, revenue
    period: str = request.args.get('period', 'monthly')  # daily, weekly, monthly
    horizon: int = request.args.get('horizon', 30, type=int)  # number of periods to forecast
    
    forecasts = analytics_crud.get_forecasts(
        db,
        branch_id=branch_id,
        forecast_type=forecast_type,
        period=period,
        horizon=horizon
    )
    return jsonify(forecasts)

@bp.route('/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get dashboard analytics data"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    # Get today's date
    today = datetime.now().date()
    start_of_month = today.replace(day=1)
    
    dashboard_data = {
        'today_sales': analytics_crud.get_sales_analytics(
            db, branch_id=branch_id, 
            start_date=today, end_date=today
        ),
        'month_sales': analytics_crud.get_sales_analytics(
            db, branch_id=branch_id,
            start_date=start_of_month, end_date=today
        ),
        'low_stock_items': analytics_crud.get_low_stock_items(
            db, branch_id=branch_id
        ),
        'top_products': analytics_crud.get_top_products(
            db, branch_id=branch_id,
            start_date=start_of_month, end_date=today
        ),
        'sales_trend': analytics_crud.get_sales_trend(
            db, branch_id=branch_id,
            days=30
        ),
        'inventory_value': analytics_crud.get_inventory_value(
            db, branch_id=branch_id
        )
    }
    
    if current_user.is_admin:
        dashboard_data.update({
            'revenue_forecast': analytics_crud.get_forecasts(
                db, forecast_type='revenue',
                period='daily', horizon=7
            ),
            'customer_stats': analytics_crud.get_customer_analytics(
                db, period='monthly',
                start_date=start_of_month, end_date=today
            )
        })
    
    return jsonify(dashboard_data) 
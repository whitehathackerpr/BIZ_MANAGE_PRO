from flask_restx import Namespace, Resource, fields
from flask import request
from ..models.sale import Sale
from ..models.product import Product
from ..utils.auth import require_auth
from datetime import datetime, timedelta
from sqlalchemy import func

api = Namespace('analytics', description='Analytics operations')

# Models
revenue_data_model = api.model('RevenueData', {
    'date': fields.Date,
    'revenue': fields.Float,
    'transactions': fields.Integer
})

product_performance_model = api.model('ProductPerformance', {
    'product_id': fields.Integer,
    'name': fields.String,
    'units_sold': fields.Integer,
    'revenue': fields.Float,
    'profit_margin': fields.Float
})

dashboard_model = api.model('Dashboard', {
    'total_revenue': fields.Float,
    'total_sales': fields.Integer,
    'average_order_value': fields.Float,
    'top_products': fields.List(fields.Nested(product_performance_model))
})

@api.route('/dashboard')
class DashboardStats(Resource):
    @api.doc('get_dashboard_stats', security='apikey')
    @api.marshal_with(dashboard_model)
    @require_auth
    def get(self):
        """Get dashboard statistics"""
        # Get date range (default: last 30 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        # Calculate total revenue and sales
        sales_data = Sale.query.filter(
            Sale.created_at.between(start_date, end_date)
        ).with_entities(
            func.sum(Sale.total).label('total_revenue'),
            func.count(Sale.id).label('total_sales')
        ).first()

        # Get top performing products
        top_products = Product.query.join(Sale).filter(
            Sale.created_at.between(start_date, end_date)
        ).group_by(Product.id).order_by(
            func.sum(Sale.total).desc()
        ).limit(5).all()

        return {
            'total_revenue': sales_data.total_revenue or 0,
            'total_sales': sales_data.total_sales or 0,
            'average_order_value': (sales_data.total_revenue / sales_data.total_sales) 
                                 if sales_data.total_sales else 0,
            'top_products': top_products
        }

@api.route('/revenue')
class RevenueAnalytics(Resource):
    @api.doc('get_revenue_analytics', security='apikey')
    @api.marshal_list_with(revenue_data_model)
    @require_auth
    def get(self):
        """Get revenue analytics"""
        period = request.args.get('period', 'daily')
        days = int(request.args.get('days', 30))
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        if period == 'daily':
            group_func = func.date(Sale.created_at)
        elif period == 'weekly':
            group_func = func.date_trunc('week', Sale.created_at)
        else:  # monthly
            group_func = func.date_trunc('month', Sale.created_at)

        revenue_data = Sale.query.filter(
            Sale.created_at.between(start_date, end_date)
        ).group_by(group_func).with_entities(
            group_func.label('date'),
            func.sum(Sale.total).label('revenue'),
            func.count(Sale.id).label('transactions')
        ).all()

        return revenue_data 
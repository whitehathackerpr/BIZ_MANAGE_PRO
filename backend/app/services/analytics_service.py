from datetime import datetime, timedelta
from sqlalchemy import func, desc
from ..models.analytics import AnalyticsEvent, AnalyticsMetric, AnalyticsReport
from ..models.sale import Sale, SaleItem
from ..models.product import Product, Category
from ..models.user import User
from ..extensions import db

class AnalyticsService:
    @staticmethod
    def get_dashboard_metrics(time_range='30days'):
        """Get comprehensive dashboard metrics for the specified time range."""
        # Calculate date range
        end_date = datetime.utcnow()
        if time_range == '7days':
            start_date = end_date - timedelta(days=7)
        elif time_range == '30days':
            start_date = end_date - timedelta(days=30)
        elif time_range == '90days':
            start_date = end_date - timedelta(days=90)
        elif time_range == '1year':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)

        # Sales metrics
        sales_metrics = {
            'total_sales': 0,
            'total_orders': 0,
            'average_order_value': 0,
            'daily_sales': []
        }

        # Get total sales and orders
        sales_data = db.session.query(
            func.count(Sale.id).label('total_orders'),
            func.sum(Sale.total_amount).label('total_sales')
        ).filter(
            Sale.created_at.between(start_date, end_date)
        ).first()

        sales_metrics['total_orders'] = sales_data.total_orders or 0
        sales_metrics['total_sales'] = float(sales_data.total_sales or 0)
        sales_metrics['average_order_value'] = (
            sales_metrics['total_sales'] / sales_metrics['total_orders']
            if sales_metrics['total_orders'] > 0 else 0
        )

        # Get daily sales
        daily_sales = db.session.query(
            func.date(Sale.created_at).label('date'),
            func.count(Sale.id).label('orders'),
            func.sum(Sale.total_amount).label('total')
        ).filter(
            Sale.created_at.between(start_date, end_date)
        ).group_by(
            func.date(Sale.created_at)
        ).order_by(
            func.date(Sale.created_at)
        ).all()

        sales_metrics['daily_sales'] = [{
            'date': sale.date.strftime('%Y-%m-%d'),
            'orders': sale.orders,
            'total': float(sale.total)
        } for sale in daily_sales]

        # Product metrics
        product_metrics = {
            'top_products': [],
            'sales_by_category': []
        }

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
            desc(func.sum(SaleItem.quantity * SaleItem.price))
        ).limit(10).all()

        product_metrics['top_products'] = [{
            'name': product.name,
            'total_quantity': int(product.total_quantity),
            'total_revenue': float(product.total_revenue)
        } for product in top_products]

        # Get sales by category
        sales_by_category = db.session.query(
            Category.name,
            func.sum(SaleItem.quantity * SaleItem.price).label('total_revenue')
        ).join(
            Product, Category.id == Product.category_id
        ).join(
            SaleItem, Product.id == SaleItem.product_id
        ).join(
            Sale, SaleItem.sale_id == Sale.id
        ).filter(
            Sale.created_at.between(start_date, end_date)
        ).group_by(
            Category.id, Category.name
        ).all()

        product_metrics['sales_by_category'] = [{
            'category': category.name,
            'total_revenue': float(category.total_revenue)
        } for category in sales_by_category]

        # Customer metrics
        customer_metrics = {
            'total_customers': 0,
            'new_customers': 0,
            'customer_growth_rate': 0
        }

        # Get customer counts
        total_customers = User.query.filter_by(role='customer').count()
        new_customers = User.query.filter(
            User.role == 'customer',
            User.created_at.between(start_date, end_date)
        ).count()

        customer_metrics['total_customers'] = total_customers
        customer_metrics['new_customers'] = new_customers
        customer_metrics['customer_growth_rate'] = (
            (new_customers / total_customers * 100)
            if total_customers > 0 else 0
        )

        # Inventory metrics
        inventory_metrics = {
            'low_stock': 0,
            'out_of_stock': 0
        }

        # Get inventory status
        low_stock = Product.query.filter(
            Product.quantity <= Product.reorder_point
        ).count()

        out_of_stock = Product.query.filter(
            Product.quantity == 0
        ).count()

        inventory_metrics['low_stock'] = low_stock
        inventory_metrics['out_of_stock'] = out_of_stock

        return {
            'sales_metrics': sales_metrics,
            'product_metrics': product_metrics,
            'customer_metrics': customer_metrics,
            'inventory_metrics': inventory_metrics
        }

    @staticmethod
    def track_event(event_type, event_data=None, user_id=None):
        """Track an analytics event"""
        return AnalyticsEvent.create_event(
            event_type=event_type,
            event_data=event_data,
            user_id=user_id
        )

    @staticmethod
    def record_metric(metric_type, metric_value, metric_date=None):
        """Record an analytics metric"""
        if metric_date is None:
            metric_date = datetime.utcnow().date()
        return AnalyticsMetric.create_metric(
            metric_type=metric_type,
            metric_value=metric_value,
            metric_date=metric_date
        )

    @staticmethod
    def generate_report(report_type, start_date, end_date, created_by):
        """Generate an analytics report"""
        # Get report data based on report type
        if report_type == 'sales':
            report_data = AnalyticsService.get_dashboard_metrics()
        elif report_type == 'inventory':
            report_data = AnalyticsService.get_inventory_metrics()
        elif report_type == 'customer':
            report_data = AnalyticsService.get_customer_metrics()
        else:
            raise ValueError(f"Invalid report type: {report_type}")

        # Create report
        return AnalyticsReport.create_report(
            report_type=report_type,
            report_data=report_data,
            start_date=start_date,
            end_date=end_date,
            created_by=created_by
        )

    @staticmethod
    def get_inventory_metrics():
        """Get inventory-related metrics"""
        total_products = Product.query.count()
        total_value = db.session.query(
            func.sum(Product.quantity * Product.price)
        ).scalar() or 0

        low_stock = Product.query.filter(
            Product.quantity <= Product.reorder_point
        ).count()

        out_of_stock = Product.query.filter(
            Product.quantity == 0
        ).count()

        return {
            'total_products': total_products,
            'total_value': float(total_value),
            'low_stock': low_stock,
            'out_of_stock': out_of_stock
        }

    @staticmethod
    def get_customer_metrics():
        """Get customer-related metrics"""
        total_customers = User.query.filter_by(role='customer').count()
        active_customers = db.session.query(
            func.count(func.distinct(Sale.customer_id))
        ).filter(
            Sale.created_at >= datetime.utcnow() - timedelta(days=30)
        ).scalar() or 0

        new_customers = User.query.filter(
            User.role == 'customer',
            User.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()

        return {
            'total_customers': total_customers,
            'active_customers': active_customers,
            'new_customers': new_customers,
            'customer_retention_rate': (
                (active_customers / total_customers * 100)
                if total_customers > 0 else 0
            )
        }

    @staticmethod
    def get_supplier_metrics():
        """Get supplier-related metrics"""
        total_suppliers = User.query.filter_by(role='supplier').count()
        active_suppliers = total_suppliers  # Placeholder, refine as needed
        new_suppliers = User.query.filter(
            User.role == 'supplier',
            User.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        return {
            'total_suppliers': total_suppliers,
            'active_suppliers': active_suppliers,
            'new_suppliers': new_suppliers,
            'supplier_growth_rate': (
                (new_suppliers / total_suppliers * 100)
                if total_suppliers > 0 else 0
            )
        } 
import pandas as pd
from datetime import datetime, timedelta
from flask import current_app
from app import db
from app.models.order import Order, OrderItem
from app.models.product import Product, Category
from app.models.inventory import InventoryTransaction
from app.models.user import User
from app.utils.export import export_to_excel, export_to_pdf

class ReportGenerator:
    @staticmethod
    def generate_sales_report(start_date, end_date, format='excel'):
        """Generate sales report for specified period."""
        # Query sales data
        sales_data = db.session.query(
            Order.order_number,
            Order.created_at,
            Order.total_amount,
            Order.status,
            'user.email'
        ).join(
            User, Order.user_id == User.id
        ).filter(
            Order.created_at.between(start_date, end_date)
        ).all()
        
        # Create DataFrame
        df = pd.DataFrame(sales_data, columns=[
            'Order Number',
            'Date',
            'Total Amount',
            'Status',
            'Customer Email'
        ])
        
        # Add summary data
        summary = {
            'Total Orders': len(df),
            'Total Sales': df['Total Amount'].sum(),
            'Average Order Value': df['Total Amount'].mean(),
            'Orders by Status': df['Status'].value_counts().to_dict()
        }
        
        if format == 'excel':
            return export_to_excel(df, 'Sales Report', summary)
        else:
            return export_to_pdf(df, 'Sales Report', summary)

    @staticmethod
    def generate_inventory_report(category_id=None, format='excel'):
        """Generate inventory status report."""
        query = db.session.query(
            Product.sku,
            Product.name,
            Category.name.label('category'),
            Product.stock,
            Product.reorder_point,
            Product.price,
            Product.cost
        ).join(Category)
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        data = query.all()
        
        df = pd.DataFrame(data, columns=[
            'SKU',
            'Product Name',
            'Category',
            'Current Stock',
            'Reorder Point',
            'Price',
            'Cost'
        ])
        
        # Add calculated columns
        df['Stock Value'] = df['Current Stock'] * df['Cost']
        df['Low Stock'] = df['Current Stock'] <= df['Reorder Point']
        
        summary = {
            'Total Products': len(df),
            'Total Stock Value': df['Stock Value'].sum(),
            'Low Stock Items': df['Low Stock'].sum(),
            'Out of Stock Items': (df['Current Stock'] == 0).sum()
        }
        
        if format == 'excel':
            return export_to_excel(df, 'Inventory Report', summary)
        else:
            return export_to_pdf(df, 'Inventory Report', summary)

    @staticmethod
    def generate_product_performance_report(start_date, end_date, format='excel'):
        """Generate product performance report."""
        data = db.session.query(
            Product.sku,
            Product.name,
            Category.name.label('category'),
            db.func.sum(OrderItem.quantity).label('total_quantity'),
            db.func.sum(OrderItem.quantity * OrderItem.price).label('total_revenue'),
            db.func.avg(OrderItem.price).label('average_price')
        ).join(
            OrderItem, Product.id == OrderItem.product_id
        ).join(
            Order, OrderItem.order_id == Order.id
        ).join(
            Category, Product.category_id == Category.id
        ).filter(
            Order.created_at.between(start_date, end_date),
            Order.status != 'cancelled'
        ).group_by(
            Product.id
        ).all()
        
        df = pd.DataFrame(data, columns=[
            'SKU',
            'Product Name',
            'Category',
            'Units Sold',
            'Total Revenue',
            'Average Price'
        ])
        
        # Sort by revenue
        df = df.sort_values('Total Revenue', ascending=False)
        
        summary = {
            'Total Revenue': df['Total Revenue'].sum(),
            'Total Units Sold': df['Units Sold'].sum(),
            'Top Category': df.groupby('Category')['Total Revenue'].sum().idxmax()
        }
        
        if format == 'excel':
            return export_to_excel(df, 'Product Performance Report', summary)
        else:
            return export_to_pdf(df, 'Product Performance Report', summary) 
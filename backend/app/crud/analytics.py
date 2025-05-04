from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, and_, or_, extract
from ..models.sale import Sale, SaleItem
from ..models.product import Product, Category
from ..models.branch import Branch
from ..models.transaction import Transaction
from ..models.inventory import Inventory
from ..models.employee import Employee

class AnalyticsCRUD:
    def get_sales_by_period(
        self,
        db: Session,
        *,
        start_date: datetime,
        end_date: datetime,
        branch_id: Optional[int] = None,
        group_by: str = "day"
    ) -> List[Dict[str, Any]]:
        """Get sales analytics grouped by time period"""
        query = db.query(
            func.date_trunc(group_by, Sale.created_at).label('period'),
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('num_sales')
        )
        
        if branch_id:
            query = query.filter(Sale.branch_id == branch_id)
            
        query = query.filter(
            and_(
                Sale.created_at >= start_date,
                Sale.created_at <= end_date,
                Sale.status == "completed"
            )
        )
        
        query = query.group_by(func.date_trunc(group_by, Sale.created_at))
        query = query.order_by(func.date_trunc(group_by, Sale.created_at))
        
        results = query.all()
        
        return [
            {
                "period": period.isoformat(),
                "total_sales": float(total_sales),
                "num_sales": num_sales
            }
            for period, total_sales, num_sales in results
        ]
    
    def get_top_products(
        self,
        db: Session,
        *,
        start_date: datetime,
        end_date: datetime,
        branch_id: Optional[int] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get top selling products by quantity or revenue"""
        query = db.query(
            Product.id,
            Product.name,
            func.sum(SaleItem.quantity).label('total_quantity'),
            func.sum(SaleItem.quantity * SaleItem.unit_price).label('total_revenue')
        ).join(
            SaleItem, SaleItem.product_id == Product.id
        ).join(
            Sale, Sale.id == SaleItem.sale_id
        ).filter(
            and_(
                Sale.created_at >= start_date,
                Sale.created_at <= end_date,
                Sale.status == "completed"
            )
        )
        
        if branch_id:
            query = query.filter(Sale.branch_id == branch_id)
            
        query = query.group_by(Product.id, Product.name)
        query = query.order_by(desc('total_quantity'))
        query = query.limit(limit)
        
        results = query.all()
        
        return [
            {
                "product_id": product_id,
                "product_name": name,
                "total_quantity": total_quantity,
                "total_revenue": float(total_revenue)
            }
            for product_id, name, total_quantity, total_revenue in results
        ]
    
    def get_sales_by_category(
        self,
        db: Session,
        *,
        start_date: datetime,
        end_date: datetime,
        branch_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get sales breakdown by product category"""
        query = db.query(
            Category.name,
            func.sum(SaleItem.quantity).label('total_quantity'),
            func.sum(SaleItem.quantity * SaleItem.unit_price).label('total_revenue')
        ).join(
            Product, Product.category_id == Category.id
        ).join(
            SaleItem, SaleItem.product_id == Product.id
        ).join(
            Sale, Sale.id == SaleItem.sale_id
        ).filter(
            and_(
                Sale.created_at >= start_date,
                Sale.created_at <= end_date,
                Sale.status == "completed"
            )
        )
        
        if branch_id:
            query = query.filter(Sale.branch_id == branch_id)
            
        query = query.group_by(Category.name)
        query = query.order_by(desc('total_revenue'))
        
        results = query.all()
        
        return [
            {
                "category": name,
                "total_quantity": total_quantity,
                "total_revenue": float(total_revenue)
            }
            for name, total_quantity, total_revenue in results
        ]
    
    def get_inventory_analytics(
        self,
        db: Session,
        *,
        branch_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get inventory analytics"""
        # Total inventory value
        value_query = db.query(
            func.sum(Inventory.quantity * Product.price).label('total_value'),
            func.count(Inventory.id).label('total_items')
        ).join(
            Product, Product.id == Inventory.product_id
        )
        
        if branch_id:
            value_query = value_query.filter(Inventory.branch_id == branch_id)
            
        value_result = value_query.first()
        
        # Low stock items
        low_stock_query = db.query(
            func.count(Inventory.id).label('low_stock_count')
        ).filter(
            Inventory.quantity <= Inventory.reorder_point
        )
        
        if branch_id:
            low_stock_query = low_stock_query.filter(Inventory.branch_id == branch_id)
            
        low_stock_result = low_stock_query.scalar()
        
        # Out of stock items
        out_of_stock_query = db.query(
            func.count(Inventory.id).label('out_of_stock_count')
        ).filter(
            Inventory.quantity == 0
        )
        
        if branch_id:
            out_of_stock_query = out_of_stock_query.filter(Inventory.branch_id == branch_id)
            
        out_of_stock_result = out_of_stock_query.scalar()
        
        total_value = value_result.total_value if value_result and value_result.total_value else 0
        
        return {
            "total_value": float(total_value),
            "total_items": value_result.total_items if value_result else 0,
            "low_stock_count": low_stock_result or 0,
            "out_of_stock_count": out_of_stock_result or 0
        }
    
    def get_sales_performance(
        self,
        db: Session,
        *,
        start_date: datetime,
        end_date: datetime,
        branch_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get sales performance metrics for comparison"""
        # Current period
        current_query = db.query(
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('num_sales'),
            func.avg(Sale.total_amount).label('avg_sale')
        ).filter(
            and_(
                Sale.created_at >= start_date,
                Sale.created_at <= end_date,
                Sale.status == "completed"
            )
        )
        
        if branch_id:
            current_query = current_query.filter(Sale.branch_id == branch_id)
            
        current_result = current_query.first()
        
        # Previous period (same length)
        period_length = end_date - start_date
        prev_end_date = start_date - timedelta(days=1)
        prev_start_date = prev_end_date - period_length
        
        prev_query = db.query(
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('num_sales'),
            func.avg(Sale.total_amount).label('avg_sale')
        ).filter(
            and_(
                Sale.created_at >= prev_start_date,
                Sale.created_at <= prev_end_date,
                Sale.status == "completed"
            )
        )
        
        if branch_id:
            prev_query = prev_query.filter(Sale.branch_id == branch_id)
            
        prev_result = prev_query.first()
        
        # Calculate growth
        curr_sales = current_result.total_sales if current_result and current_result.total_sales else 0
        prev_sales = prev_result.total_sales if prev_result and prev_result.total_sales else 0
        
        if prev_sales > 0:
            sales_growth = ((curr_sales - prev_sales) / prev_sales) * 100
        else:
            sales_growth = 100 if curr_sales > 0 else 0
            
        curr_count = current_result.num_sales if current_result else 0
        prev_count = prev_result.num_sales if prev_result else 0
        
        if prev_count > 0:
            count_growth = ((curr_count - prev_count) / prev_count) * 100
        else:
            count_growth = 100 if curr_count > 0 else 0
            
        return {
            "current_period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "total_sales": float(curr_sales),
                "num_sales": curr_count,
                "avg_sale": float(current_result.avg_sale) if current_result and current_result.avg_sale else 0
            },
            "previous_period": {
                "start_date": prev_start_date.isoformat(),
                "end_date": prev_end_date.isoformat(),
                "total_sales": float(prev_sales),
                "num_sales": prev_count,
                "avg_sale": float(prev_result.avg_sale) if prev_result and prev_result.avg_sale else 0
            },
            "growth": {
                "sales_growth": round(sales_growth, 2),
                "count_growth": round(count_growth, 2)
            }
        }

# Create an instance
analytics_crud = AnalyticsCRUD() 
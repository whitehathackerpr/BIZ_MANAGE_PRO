from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime
from ..models.sale import Sale, SaleItem
from ..schemas.sale import SaleCreate, SaleUpdate, SaleFilter

class SaleCRUD:
    def get(self, db: Session, id: int) -> Optional[Sale]:
        """Get sale by id"""
        return db.query(Sale).filter(Sale.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[SaleFilter] = None
    ) -> List[Sale]:
        """Get multiple sales with optional filters"""
        query = db.query(Sale)
        
        if filters:
            if filters.branch_id:
                query = query.filter(Sale.branch_id == filters.branch_id)
            
            if filters.cashier_id:
                query = query.filter(Sale.cashier_id == filters.cashier_id)
                
            if filters.customer_id:
                query = query.filter(Sale.customer_id == filters.customer_id)
                
            if filters.status:
                query = query.filter(Sale.status == filters.status)
                
            if filters.payment_method:
                query = query.filter(Sale.payment_method == filters.payment_method)
                
            if filters.min_amount is not None:
                query = query.filter(Sale.total_amount >= filters.min_amount)
                
            if filters.max_amount is not None:
                query = query.filter(Sale.total_amount <= filters.max_amount)
                
            if filters.start_date and filters.end_date:
                query = query.filter(
                    and_(
                        Sale.created_at >= filters.start_date,
                        Sale.created_at <= filters.end_date
                    )
                )
            elif filters.start_date:
                query = query.filter(Sale.created_at >= filters.start_date)
            elif filters.end_date:
                query = query.filter(Sale.created_at <= filters.end_date)
        
        # Always order by creation time (newest first)
        query = query.order_by(desc(Sale.created_at))
            
        return query.offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in: SaleCreate) -> Sale:
        """Create new sale with items"""
        # Create sale object
        total_amount = 0
        
        db_sale = Sale(
            customer_id=obj_in.customer_id,
            cashier_id=obj_in.cashier_id,
            branch_id=obj_in.branch_id,
            payment_method=obj_in.payment_method,
            status=obj_in.status,
            discount=obj_in.discount,
            tax=obj_in.tax,
            notes=obj_in.notes,
            total_amount=total_amount  # Will be updated after adding items
        )
        db.add(db_sale)
        db.flush()  # Flush to get the sale ID
        
        # Create sale items
        for item_data in obj_in.items:
            db_item = SaleItem(
                sale_id=db_sale.id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                discount=item_data.discount,
                tax_rate=item_data.tax_rate
            )
            db.add(db_item)
            
            # Calculate item total and add to sale total
            item_total = (item_data.unit_price * item_data.quantity) * (1 - item_data.discount / 100)
            if item_data.tax_rate:
                item_total = item_total * (1 + item_data.tax_rate / 100)
            total_amount += item_total
        
        # Apply sale-level discount and tax
        total_amount = total_amount * (1 - db_sale.discount / 100)
        total_amount = total_amount * (1 + db_sale.tax / 100)
        
        # Update sale total
        db_sale.total_amount = total_amount
        
        db.commit()
        db.refresh(db_sale)
        return db_sale
    
    def update(
        self, 
        db: Session, 
        *, 
        db_obj: Sale, 
        obj_in: Union[SaleUpdate, Dict[str, Any]]
    ) -> Sale:
        """Update sale"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> Sale:
        """Delete sale"""
        obj = db.query(Sale).get(id)
        
        # First delete related items
        db.query(SaleItem).filter(SaleItem.sale_id == id).delete()
        
        # Then delete sale
        db.delete(obj)
        db.commit()
        return obj
    
    def get_sales_by_date_range(
        self,
        db: Session,
        *,
        start_date: datetime,
        end_date: datetime,
        branch_id: Optional[int] = None
    ) -> List[Sale]:
        """Get sales by date range"""
        query = db.query(Sale).filter(
            and_(
                Sale.created_at >= start_date,
                Sale.created_at <= end_date
            )
        )
        
        if branch_id:
            query = query.filter(Sale.branch_id == branch_id)
            
        return query.all()
    
    def get_sales_by_cashier(
        self,
        db: Session,
        *,
        cashier_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Sale]:
        """Get sales by cashier"""
        query = db.query(Sale).filter(Sale.cashier_id == cashier_id)
        
        if start_date and end_date:
            query = query.filter(
                and_(
                    Sale.created_at >= start_date,
                    Sale.created_at <= end_date
                )
            )
        elif start_date:
            query = query.filter(Sale.created_at >= start_date)
        elif end_date:
            query = query.filter(Sale.created_at <= end_date)
            
        return query.all()
    
    def get_sale_items(self, db: Session, *, sale_id: int) -> List[SaleItem]:
        """Get items for a sale"""
        return db.query(SaleItem).filter(SaleItem.sale_id == sale_id).all()

# Create an instance
sale_crud = SaleCRUD() 
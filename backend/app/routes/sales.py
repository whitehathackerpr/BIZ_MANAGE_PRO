from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from ..models import Sale, SaleItem, Order, OrderItem, Product, Transaction, User
from ..extensions import get_db
from ..utils.decorators import admin_required
from ..utils.validation import validate_sale_data

router = APIRouter()

# Pydantic models
class SaleItemBase(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int
    price: float
    discount: float = 0
    notes: Optional[str] = None

class SaleBase(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    payment_method: str = "cash"
    payment_status: str = "completed"
    notes: Optional[str] = None
    items: List[SaleItemBase]

class SaleCreate(SaleBase):
    pass

class SaleItemResponse(SaleItemBase):
    id: int
    sale_id: int
    product: Product
    subtotal: float

    class Config:
        from_attributes = True

class SaleResponse(SaleBase):
    id: int
    user_id: int
    total_amount: float
    subtotal: float
    created_at: datetime
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True

class SalesResponse(BaseModel):
    sales: List[SaleResponse]
    total: int
    pages: int
    current_page: int

# Routes
@router.get("/sales", response_model=SalesResponse)
async def get_sales(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Sale)
    
    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)
    if status:
        query = query.filter_by(payment_status=status)
    
    sales = query.order_by(Sale.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()
    
    total = query.count()
    
    return {
        "sales": sales,
        "total": total,
        "pages": (total + per_page - 1) // per_page,
        "current_page": page
    }

@router.post("/sales", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate sale data
    errors = validate_sale_data(sale.dict())
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Create sale
    db_sale = Sale(
        user_id=current_user.id,
        customer_name=sale.customer_name,
        customer_email=sale.customer_email,
        customer_phone=sale.customer_phone,
        payment_method=sale.payment_method,
        payment_status="completed" if sale.payment_method == "cash" else "pending",
        notes=sale.notes
    )
    
    # Add sale items
    total_amount = 0
    for item_data in sale.items:
        product = db.query(Product).get(item_data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item_data.product_id} not found"
            )
        
        if product.stock < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.name}"
            )
        
        sale_item = SaleItem(
            sale=db_sale,
            product=product,
            variant_id=item_data.variant_id,
            quantity=item_data.quantity,
            price=product.price,
            discount=item_data.discount,
            notes=item_data.notes
        )
        
        # Update product stock
        product.stock -= item_data.quantity
        
        db_sale.items.append(sale_item)
        total_amount += sale_item.subtotal
    
    db_sale.total_amount = total_amount
    db_sale.subtotal = total_amount
    
    # Create transaction record
    if sale.payment_method == "cash":
        transaction = Transaction(
            type="income",
            amount=total_amount,
            description=f"Sale #{db_sale.id}",
            date=datetime.utcnow(),
            sale_id=db_sale.id
        )
        db.add(transaction)
    
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    
    return db_sale

@router.get("/sales/{sale_id}", response_model=SaleResponse)
async def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).get(sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )
    return sale

@router.put("/sales/{sale_id}", response_model=SaleResponse)
async def update_sale(
    sale_id: int,
    sale_update: SaleBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).get(sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )
    
    # Validate sale data
    errors = validate_sale_data(sale_update.dict(), partial=True)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Update sale fields
    for key, value in sale_update.dict().items():
        if key != "items":  # Don't update items here
            setattr(sale, key, value)
    
    db.commit()
    db.refresh(sale)
    return sale

@router.post("/sales/{sale_id}/items", response_model=SaleItemResponse)
async def add_sale_item(
    sale_id: int,
    item: SaleItemBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).get(sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )
    
    product = db.query(Product).get(item.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {item.product_id} not found"
        )
    
    if product.stock < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock for product {product.name}"
        )
    
    sale_item = SaleItem(
        sale=sale,
        product=product,
        variant_id=item.variant_id,
        quantity=item.quantity,
        price=product.price,
        discount=item.discount,
        notes=item.notes
    )
    
    # Update product stock
    product.stock -= item.quantity
    
    sale.items.append(sale_item)
    sale.calculate_totals()
    
    db.commit()
    db.refresh(sale_item)
    return sale_item

@router.put("/sales/{sale_id}/items/{item_id}", response_model=SaleItemResponse)
async def update_sale_item(
    sale_id: int,
    item_id: int,
    item_update: SaleItemBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).get(sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )
    
    sale_item = db.query(SaleItem).get(item_id)
    if not sale_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale item not found"
        )
    
    if sale_item.sale_id != sale.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item does not belong to this sale"
        )
    
    # Restore previous stock
    sale_item.product.stock += sale_item.quantity
    
    # Update item
    if item_update.quantity:
        if sale_item.product.stock < item_update.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {sale_item.product.name}"
            )
        sale_item.quantity = item_update.quantity
        sale_item.product.stock -= item_update.quantity
    
    if item_update.price:
        sale_item.price = item_update.price
    if item_update.discount is not None:
        sale_item.discount = item_update.discount
    if item_update.notes is not None:
        sale_item.notes = item_update.notes
    
    sale.calculate_totals()
    db.commit()
    db.refresh(sale_item)
    return sale_item

@router.delete("/sales/{sale_id}/items/{item_id}")
async def delete_sale_item(
    sale_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = db.query(Sale).get(sale_id)
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )
    
    sale_item = db.query(SaleItem).get(item_id)
    if not sale_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale item not found"
        )
    
    if sale_item.sale_id != sale.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item does not belong to this sale"
        )
    
    # Restore product stock
    sale_item.product.stock += sale_item.quantity
    
    db.delete(sale_item)
    sale.calculate_totals()
    db.commit()
    return {"message": "Item deleted successfully"}

@router.get("/sales/analytics")
async def get_sales_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    # Get total sales
    total_sales = db.query(func.count(Sale.id)).scalar()
    total_revenue = db.query(func.sum(Sale.total_amount)).scalar() or 0
    
    # Get sales by payment method
    sales_by_payment = db.query(
        Sale.payment_method,
        func.count(Sale.id).label('count'),
        func.sum(Sale.total_amount).label('total')
    ).group_by(Sale.payment_method).all()
    
    # Get sales by status
    sales_by_status = db.query(
        Sale.payment_status,
        func.count(Sale.id).label('count'),
        func.sum(Sale.total_amount).label('total')
    ).group_by(Sale.payment_status).all()
    
    # Get top products
    top_products = db.query(
        Product.name,
        func.sum(SaleItem.quantity).label('total_quantity'),
        func.sum(SaleItem.subtotal).label('total_revenue')
    ).join(
        SaleItem, Product.id == SaleItem.product_id
    ).group_by(
        Product.id, Product.name
    ).order_by(
        func.sum(SaleItem.subtotal).desc()
    ).limit(10).all()
    
    # Get sales trend
    sales_trend = db.query(
        func.date_trunc('day', Sale.created_at).label('date'),
        func.count(Sale.id).label('count'),
        func.sum(Sale.total_amount).label('total')
    ).filter(
        Sale.created_at.between(start_date, end_date)
    ).group_by(
        func.date_trunc('day', Sale.created_at)
    ).order_by(
        func.date_trunc('day', Sale.created_at)
    ).all()
    
    return {
        "total_sales": total_sales,
        "total_revenue": float(total_revenue),
        "sales_by_payment": [{
            "method": method,
            "count": count,
            "total": float(total)
        } for method, count, total in sales_by_payment],
        "sales_by_status": [{
            "status": status,
            "count": count,
            "total": float(total)
        } for status, count, total in sales_by_status],
        "top_products": [{
            "name": name,
            "total_quantity": total_quantity,
            "total_revenue": float(total_revenue)
        } for name, total_quantity, total_revenue in top_products],
        "sales_trend": [{
            "date": date.strftime("%Y-%m-%d"),
            "count": count,
            "total": float(total)
        } for date, count, total in sales_trend]
    } 
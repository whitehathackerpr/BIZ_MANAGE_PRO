from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..models import Product, Category, ProductVariant, Supplier, Transaction, User
from ..extensions import get_db
from ..utils.decorators import admin_required
from ..utils.validation import validate_inventory_data

router = APIRouter()

# Pydantic models
class InventoryBase(BaseModel):
    product_id: int
    quantity: int
    reason: Optional[str] = None

class InventoryAdjust(InventoryBase):
    type: str  # add, remove

class InventoryTransfer(InventoryBase):
    target_product_id: int

class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    description: str
    price: float
    stock: int
    min_stock_level: int
    category_id: Optional[int]
    supplier_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StockLevelsResponse(BaseModel):
    low_stock: List[ProductResponse]
    out_of_stock: List[ProductResponse]
    stock_value_by_category: List[dict]
    total_inventory_value: float

class StockHistoryResponse(BaseModel):
    history: List[dict]

class SupplierStockResponse(BaseModel):
    supplier_stock: List[dict]

# Routes
@router.get("/inventory", response_model=dict)
async def get_inventory(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: str = "",
    stock_status: Optional[str] = None,
    supplier_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Product)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    if stock_status:
        if stock_status == 'low':
            query = query.filter(Product.stock <= Product.min_stock_level)
        elif stock_status == 'out':
            query = query.filter(Product.stock == 0)
        elif stock_status == 'in_stock':
            query = query.filter(Product.stock > 0)
    if supplier_id:
        query = query.filter_by(supplier_id=supplier_id)
    
    products = query.order_by(Product.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()
    
    total = query.count()
    
    return {
        "products": products,
        "total": total,
        "pages": (total + per_page - 1) // per_page,
        "current_page": page
    }

@router.post("/inventory/adjust", response_model=dict)
async def adjust_inventory(
    adjustment: InventoryAdjust,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate inventory data
    errors = validate_inventory_data(adjustment.dict())
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    product = db.query(Product).get(adjustment.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if adjustment.type == 'remove' and product.stock < adjustment.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Insufficient stock for product {product.name}'
        )
    
    # Update stock
    if adjustment.type == 'add':
        product.stock += adjustment.quantity
    else:
        product.stock -= adjustment.quantity
    
    # Create transaction record
    transaction = Transaction(
        type='expense' if adjustment.type == 'add' else 'income',
        amount=product.price * adjustment.quantity,
        description=f'Inventory adjustment: {adjustment.type} {adjustment.quantity} units of {product.name}',
        category='inventory',
        reference_number=f'INV-{datetime.utcnow().strftime("%Y%m%d%H%M")}',
        date=datetime.utcnow(),
        notes=adjustment.reason
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(product)
    
    return {
        "message": "Inventory adjusted successfully",
        "product": product
    }

@router.post("/inventory/transfer", response_model=dict)
async def transfer_inventory(
    transfer: InventoryTransfer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate transfer data
    errors = validate_inventory_data(transfer.dict(), transfer=True)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    source_product = db.query(Product).get(transfer.product_id)
    target_product = db.query(Product).get(transfer.target_product_id)
    
    if not source_product or not target_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source or target product not found"
        )
    
    if source_product.stock < transfer.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Insufficient stock for product {source_product.name}'
        )
    
    # Update stock
    source_product.stock -= transfer.quantity
    target_product.stock += transfer.quantity
    
    # Create transaction records
    source_transaction = Transaction(
        type='expense',
        amount=source_product.price * transfer.quantity,
        description=f'Inventory transfer: {transfer.quantity} units from {source_product.name} to {target_product.name}',
        category='inventory',
        reference_number=f'TRF-{datetime.utcnow().strftime("%Y%m%d%H%M")}',
        date=datetime.utcnow(),
        notes=transfer.reason
    )
    
    target_transaction = Transaction(
        type='income',
        amount=target_product.price * transfer.quantity,
        description=f'Inventory transfer: {transfer.quantity} units from {source_product.name} to {target_product.name}',
        category='inventory',
        reference_number=f'TRF-{datetime.utcnow().strftime("%Y%m%d%H%M")}',
        date=datetime.utcnow(),
        notes=transfer.reason
    )
    
    db.add(source_transaction)
    db.add(target_transaction)
    db.commit()
    db.refresh(source_product)
    db.refresh(target_product)
    
    return {
        "message": "Inventory transferred successfully",
        "source_product": source_product,
        "target_product": target_product
    }

@router.get("/inventory/stock-levels", response_model=StockLevelsResponse)
async def get_stock_levels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get low stock products
    low_stock = db.query(Product).filter(
        Product.stock <= Product.min_stock_level
    ).order_by(Product.stock.asc()).all()
    
    # Get out of stock products
    out_of_stock = db.query(Product).filter(
        Product.stock == 0
    ).order_by(Product.name.asc()).all()
    
    # Get stock value by category
    stock_value_by_category = db.query(
        Category.name,
        func.sum(Product.stock * Product.price).label('total_value')
    ).join(
        Product, Category.id == Product.category_id
    ).group_by(
        Category.id, Category.name
    ).all()
    
    # Get total inventory value
    total_value = db.query(
        func.sum(Product.stock * Product.price)
    ).scalar() or 0
    
    return {
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "stock_value_by_category": [{
            "category": category.name,
            "total_value": float(category.total_value)
        } for category in stock_value_by_category],
        "total_inventory_value": float(total_value)
    }

@router.get("/inventory/stock-history", response_model=StockHistoryResponse)
async def get_stock_history(
    product_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter_by(category='inventory')
    
    if product_id:
        query = query.filter(
            Transaction.description.ilike(f'%{product_id}%')
        )
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    history = query.order_by(Transaction.date.desc()).all()
    
    return {
        "history": [transaction.to_dict() for transaction in history]
    }

@router.get("/inventory/supplier-stock", response_model=SupplierStockResponse)
async def get_supplier_stock(
    supplier_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Product)
    
    if supplier_id:
        query = query.filter_by(supplier_id=supplier_id)
    
    products = query.all()
    
    # Group products by supplier
    supplier_stock = {}
    for product in products:
        if product.supplier_id not in supplier_stock:
            supplier_stock[product.supplier_id] = {
                "supplier": product.supplier.to_dict() if product.supplier else None,
                "products": [],
                "total_value": 0
            }
        
        supplier_stock[product.supplier_id]["products"].append(product.to_dict())
        supplier_stock[product.supplier_id]["total_value"] += product.stock * product.price
    
    return {
        "supplier_stock": list(supplier_stock.values())
    } 
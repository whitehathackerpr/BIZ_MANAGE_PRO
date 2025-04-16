from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...core.deps import get_db, get_current_user
from ...crud import product as crud_product
from ...schemas.product import (
    Product,
    ProductCreate,
    ProductUpdate,
    ProductList
)
from ...models.user import User

router = APIRouter()

@router.get("/", response_model=ProductList)
def read_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    status: Optional[str] = None,
    branch_id: Optional[int] = None,
    supplier_id: Optional[int] = None
):
    """
    Retrieve products with optional filtering.
    """
    filters = {}
    if category:
        filters["category"] = category
    if status:
        filters["status"] = status
    if branch_id:
        filters["branch_id"] = branch_id
    if supplier_id:
        filters["supplier_id"] = supplier_id
    
    products = crud_product.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        filters=filters
    )
    total = len(products)
    return {"items": products, "total": total}

@router.post("/", response_model=Product)
def create_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    product_in: ProductCreate
):
    """
    Create new product.
    """
    # Check if SKU already exists
    if crud_product.get_by_sku(db=db, sku=product_in.sku):
        raise HTTPException(
            status_code=400,
            detail="Product with this SKU already exists"
        )
    
    # Check if barcode already exists
    if product_in.barcode and crud_product.get_by_barcode(db=db, barcode=product_in.barcode):
        raise HTTPException(
            status_code=400,
            detail="Product with this barcode already exists"
        )
    
    return crud_product.create(db=db, obj_in=product_in)

@router.get("/{product_id}", response_model=Product)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get product by ID.
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    return product

@router.put("/{product_id}", response_model=Product)
def update_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    product_id: int,
    product_in: ProductUpdate
):
    """
    Update product.
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    
    # Check if new SKU already exists
    if product_in.sku and product_in.sku != product.sku:
        if crud_product.get_by_sku(db=db, sku=product_in.sku):
            raise HTTPException(
                status_code=400,
                detail="Product with this SKU already exists"
            )
    
    # Check if new barcode already exists
    if product_in.barcode and product_in.barcode != product.barcode:
        if crud_product.get_by_barcode(db=db, barcode=product_in.barcode):
            raise HTTPException(
                status_code=400,
                detail="Product with this barcode already exists"
            )
    
    return crud_product.update(db=db, db_obj=product, obj_in=product_in)

@router.delete("/{product_id}", response_model=Product)
def delete_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    product_id: int
):
    """
    Delete product.
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    return crud_product.remove(db=db, id=product_id)

@router.get("/search/", response_model=List[Product])
def search_products(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    query: str = Query(..., min_length=1),
    skip: int = 0,
    limit: int = 100
):
    """
    Search products by name, SKU, or description.
    """
    return crud_product.search(
        db=db,
        query=query,
        skip=skip,
        limit=limit
    )

@router.get("/low-stock/", response_model=List[Product])
def get_low_stock_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get products with low stock.
    """
    return crud_product.check_low_stock(db=db)

@router.post("/{product_id}/update-quantity/", response_model=Product)
def update_product_quantity(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    product_id: int,
    quantity_change: int
):
    """
    Update product quantity.
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    
    try:
        return crud_product.update_quantity(
            db=db,
            db_obj=product,
            quantity_change=quantity_change
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        ) 
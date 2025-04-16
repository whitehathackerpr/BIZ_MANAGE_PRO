from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core.deps import get_db, get_current_user
from ...crud import product as crud_product
from ...schemas.product import (
    Product,
    ProductCreate,
    ProductUpdate,
    ProductList,
    ProductResponse
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

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new product.
    
    - **name**: Product name
    - **description**: Product description
    - **price**: Product price
    - **stock**: Initial stock quantity
    - **category_id**: Product category ID
    - **supplier_id**: Supplier ID
    """
    # Check if SKU already exists
    if crud_product.get_by_sku(db=db, sku=product.sku):
        raise HTTPException(
            status_code=400,
            detail="Product with this SKU already exists"
        )
    
    # Check if barcode already exists
    if product.barcode and crud_product.get_by_barcode(db=db, barcode=product.barcode):
        raise HTTPException(
            status_code=400,
            detail="Product with this barcode already exists"
        )
    
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific product by ID.
    
    - **product_id**: The ID of the product to retrieve
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a product.
    
    - **product_id**: The ID of the product to update
    - **name**: New product name (optional)
    - **description**: New product description (optional)
    - **price**: New product price (optional)
    - **stock**: New stock quantity (optional)
    - **category_id**: New category ID (optional)
    - **supplier_id**: New supplier ID (optional)
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    
    for field, value in product_update.dict(exclude_unset=True).items():
        setattr(product, field, value)
    
    # Check if new SKU already exists
    if product_update.sku and product_update.sku != product.sku:
        if crud_product.get_by_sku(db=db, sku=product_update.sku):
            raise HTTPException(
                status_code=400,
                detail="Product with this SKU already exists"
            )
    
    # Check if new barcode already exists
    if product_update.barcode and product_update.barcode != product.barcode:
        if crud_product.get_by_barcode(db=db, barcode=product_update.barcode):
            raise HTTPException(
                status_code=400,
                detail="Product with this barcode already exists"
            )
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a product.
    
    - **product_id**: The ID of the product to delete
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    
    crud_product.remove(db=db, id=product_id)
    return None

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
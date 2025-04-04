from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from routes.auth import get_current_user, User

router = APIRouter()

# Models
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int
    price: float
    cost: float
    sku: str
    barcode: Optional[str] = None
    min_stock_level: int
    max_stock_level: int

class ProductCreate(ProductBase):
    initial_stock: int = 0

class Product(ProductBase):
    id: int
    current_stock: int
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class StockMovement(BaseModel):
    product_id: int
    quantity: int
    type: str  # 'in' or 'out'
    reference: Optional[str] = None
    notes: Optional[str] = None

class StockMovementResponse(StockMovement):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class Category(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True

# Routes
@router.get("/products", response_model=List[Product])
async def get_products(
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # TODO: Get products from database with filters
    return []

@router.post("/products", response_model=Product)
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_user)
):
    # TODO: Create product in database
    return product

@router.get("/products/{product_id}", response_model=Product)
async def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user)
):
    # TODO: Get product from database
    return None

@router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_update: ProductBase,
    current_user: User = Depends(get_current_user)
):
    # TODO: Update product in database
    return product_update

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user)
):
    # TODO: Delete product from database
    return {"message": "Product deleted successfully"}

@router.post("/stock-movements", response_model=StockMovementResponse)
async def create_stock_movement(
    movement: StockMovement,
    current_user: User = Depends(get_current_user)
):
    # TODO: Create stock movement and update product stock
    return movement

@router.get("/stock-movements", response_model=List[StockMovementResponse])
async def get_stock_movements(
    skip: int = 0,
    limit: int = 10,
    product_id: Optional[int] = None,
    type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # TODO: Get stock movements from database with filters
    return []

@router.get("/categories", response_model=List[Category])
async def get_categories(current_user: User = Depends(get_current_user)):
    # TODO: Get categories from database
    return []

@router.post("/categories", response_model=Category)
async def create_category(
    category: Category,
    current_user: User = Depends(get_current_user)
):
    # TODO: Create category in database
    return category

@router.get("/low-stock", response_model=List[Product])
async def get_low_stock_products(current_user: User = Depends(get_current_user)):
    # TODO: Get products with low stock
    return []

@router.get("/out-of-stock", response_model=List[Product])
async def get_out_of_stock_products(current_user: User = Depends(get_current_user)):
    # TODO: Get out of stock products
    return [] 
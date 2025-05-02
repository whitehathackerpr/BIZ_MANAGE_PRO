from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import or_

from ..models import Product, Category, ProductImage, ProductVariant, User
from ..extensions import get_db
from ..utils.decorators import admin_required
from ..utils.images import save_image, delete_image
from ..utils.validation import validate_product_data
from app.schemas.product import ProductImageResponse, ProductVariantResponse

router = APIRouter()

# Pydantic models
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category_id: Optional[int] = None
    sku: str
    barcode: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    min_stock_level: int = 10
    supplier_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    images: List[ProductImageResponse]
    variants: List[ProductVariantResponse]

    class Config:
        from_attributes = True

class ProductVariantBase(BaseModel):
    name: str
    sku: str
    price_adjustment: float = 0
    stock: int = 0
    attributes: Optional[dict] = None

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BarcodeBase(BaseModel):
    code: str
    type: str
    is_primary: bool = False

class BarcodeResponse(BarcodeBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Routes
@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: str = Query(""),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
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
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock:
        query = query.filter(Product.stock > 0)
    
    products = query.order_by(Product.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # Convert images and variants to Pydantic response models for each product
    for product in products:
        product.images = [ProductImageResponse.from_orm(img) for img in getattr(product, 'images', [])]
        product.variants = [ProductVariantResponse.from_orm(var) for var in getattr(product, 'variants', [])]
    
    return products

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    # Validate product data
    errors = validate_product_data(product.dict())
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Check for duplicate SKU
    if db.query(Product).filter_by(sku=product.sku).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )
    
    db_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category_id=product.category_id,
        sku=product.sku,
        barcode=product.barcode,
        weight=product.weight,
        dimensions=product.dimensions,
        min_stock_level=product.min_stock_level,
        supplier_id=product.supplier_id
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product.images = [ProductImageResponse.from_orm(img) for img in getattr(product, 'images', [])]
    product.variants = [ProductVariantResponse.from_orm(var) for var in getattr(product, 'variants', [])]
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    db_product = db.query(Product).get(product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Validate product data
    errors = validate_product_data(product_update.dict(), partial=True)
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=errors
        )
    
    # Check for duplicate SKU if SKU is being updated
    if product_update.sku != db_product.sku:
        if db.query(Product).filter_by(sku=product_update.sku).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU already exists"
            )
        db_product.sku = product_update.sku
    
    # Update other fields
    db_product.name = product_update.name
    db_product.description = product_update.description
    db_product.price = product_update.price
    db_product.stock = product_update.stock
    db_product.category_id = product_update.category_id
    db_product.barcode = product_update.barcode
    db_product.weight = product_update.weight
    db_product.dimensions = product_update.dimensions
    db_product.min_stock_level = product_update.min_stock_level
    db_product.supplier_id = product_update.supplier_id
    
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Delete associated images
    for image in product.images:
        delete_image(image.filename)
        db.delete(image)
    
    db.delete(product)
    db.commit()
    
    return {"message": "Product deleted successfully"}

@router.post("/products/{product_id}/images")
async def add_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided"
        )
    
    filename = save_image(image)
    db_image = ProductImage(
        product_id=product_id,
        filename=filename,
        url=f"/uploads/{filename}",
        is_primary=not product.images
    )
    
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return {
        "message": "Image added successfully",
        "image": db_image
    }

@router.delete("/products/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    image = db.query(ProductImage).get(image_id)
    if not image or image.product_id != product_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    delete_image(image.filename)
    db.delete(image)
    db.commit()
    
    return {"message": "Image deleted successfully"}

@router.post("/products/{product_id}/variants", response_model=ProductVariantResponse)
async def add_product_variant(
    product_id: int,
    variant: ProductVariantBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check for duplicate SKU
    if db.query(ProductVariant).filter_by(sku=variant.sku).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )
    
    db_variant = ProductVariant(
        product_id=product_id,
        name=variant.name,
        sku=variant.sku,
        price_adjustment=variant.price_adjustment,
        stock=variant.stock,
        attributes=variant.attributes
    )
    
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    
    return db_variant

@router.put("/products/{product_id}/variants/{variant_id}", response_model=ProductVariantResponse)
async def update_product_variant(
    product_id: int,
    variant_id: int,
    variant_update: ProductVariantBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    variant = db.query(ProductVariant).get(variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found"
        )
    
    # Check for duplicate SKU if SKU is being updated
    if variant_update.sku != variant.sku:
        if db.query(ProductVariant).filter_by(sku=variant_update.sku).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU already exists"
            )
        variant.sku = variant_update.sku
    
    # Update other fields
    variant.name = variant_update.name
    variant.price_adjustment = variant_update.price_adjustment
    variant.stock = variant_update.stock
    variant.attributes = variant_update.attributes
    
    db.commit()
    db.refresh(variant)
    
    return variant

@router.delete("/products/{product_id}/variants/{variant_id}")
async def delete_product_variant(
    product_id: int,
    variant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    variant = db.query(ProductVariant).get(variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found"
        )
    
    db.delete(variant)
    db.commit()
    
    return {"message": "Variant deleted successfully"}

@router.post("/scan-barcode")
async def scan_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter_by(barcode=barcode).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product

@router.post("/products/{product_id}/barcodes", response_model=BarcodeResponse)
async def add_barcode(
    product_id: int,
    barcode: BarcodeBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check for duplicate barcode
    if db.query(Barcode).filter_by(code=barcode.code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Barcode already exists"
        )
    
    db_barcode = Barcode(
        product_id=product_id,
        code=barcode.code,
        type=barcode.type,
        is_primary=barcode.is_primary
    )
    
    db.add(db_barcode)
    db.commit()
    db.refresh(db_barcode)
    
    return db_barcode

@router.delete("/products/{product_id}/barcodes/{barcode_id}")
async def delete_barcode(
    product_id: int,
    barcode_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    barcode = db.query(Barcode).get(barcode_id)
    if not barcode or barcode.product_id != product_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barcode not found"
        )
    
    db.delete(barcode)
    db.commit()
    
    return {"message": "Barcode deleted successfully"} 
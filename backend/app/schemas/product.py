from typing import List, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime
from ..models.product import ProductStatus, ProductCategory

class ProductBase(BaseModel):
    """
    Base product schema with common attributes.
    
    Attributes:
        name (str): Product name
        sku (str): Stock Keeping Unit
        description (Optional[str]): Product description
        price (float): Product price
        cost (float): Product cost
        status (ProductStatus): Product status
        category (ProductCategory): Product category
        quantity (int): Current quantity in stock
        min_quantity (int): Minimum quantity threshold
        max_quantity (int): Maximum quantity threshold
        unit (Optional[str]): Unit of measurement
        barcode (Optional[str]): Product barcode
        weight (Optional[float]): Product weight
        dimensions (Optional[str]): Product dimensions
        branch_id (Optional[int]): Branch ID
        supplier_id (Optional[int]): Supplier ID
    """
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=50, description="Stock Keeping Unit")
    description: Optional[str] = Field(None, description="Product description")
    price: float = Field(..., gt=0, description="Product price")
    cost: float = Field(..., gt=0, description="Product cost")
    status: ProductStatus = Field(ProductStatus.ACTIVE, description="Product status")
    category: ProductCategory = Field(..., description="Product category")
    quantity: int = Field(0, ge=0, description="Current quantity in stock")
    min_quantity: int = Field(0, ge=0, description="Minimum quantity threshold")
    max_quantity: int = Field(0, ge=0, description="Maximum quantity threshold")
    unit: Optional[str] = Field(None, max_length=20, description="Unit of measurement")
    barcode: Optional[str] = Field(None, max_length=50, description="Product barcode")
    weight: Optional[float] = Field(None, ge=0, description="Product weight")
    dimensions: Optional[str] = Field(None, max_length=50, description="Product dimensions")
    branch_id: Optional[int] = Field(None, description="Branch ID")
    supplier_id: Optional[int] = Field(None, description="Supplier ID")

    @validator('max_quantity')
    def validate_max_quantity(cls, v, values):
        """
        Validate that max_quantity is greater than or equal to min_quantity.
        """
        if 'min_quantity' in values and v < values['min_quantity']:
            raise ValueError('max_quantity must be greater than or equal to min_quantity')
        return v

class ProductCreate(ProductBase):
    """
    Schema for creating a new product.
    Inherits all fields from ProductBase.
    """
    pass

class ProductUpdate(BaseModel):
    """
    Schema for updating a product.
    
    Attributes:
        name (Optional[str]): New product name
        sku (Optional[str]): New SKU
        description (Optional[str]): New description
        price (Optional[float]): New price
        cost (Optional[float]): New cost
        status (Optional[ProductStatus]): New status
        category (Optional[ProductCategory]): New category
        quantity (Optional[int]): New quantity
        min_quantity (Optional[int]): New minimum quantity
        max_quantity (Optional[int]): New maximum quantity
        unit (Optional[str]): New unit
        barcode (Optional[str]): New barcode
        weight (Optional[float]): New weight
        dimensions (Optional[str]): New dimensions
        branch_id (Optional[int]): New branch ID
        supplier_id (Optional[int]): New supplier ID
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    cost: Optional[float] = Field(None, gt=0)
    status: Optional[ProductStatus] = None
    category: Optional[ProductCategory] = None
    quantity: Optional[int] = Field(None, ge=0)
    min_quantity: Optional[int] = Field(None, ge=0)
    max_quantity: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=20)
    barcode: Optional[str] = Field(None, max_length=50)
    weight: Optional[float] = Field(None, ge=0)
    dimensions: Optional[str] = Field(None, max_length=50)
    branch_id: Optional[int] = None
    supplier_id: Optional[int] = None

    @validator('max_quantity')
    def validate_max_quantity(cls, v, values):
        """
        Validate that max_quantity is greater than or equal to min_quantity.
        """
        if 'min_quantity' in values and v is not None and values['min_quantity'] is not None and v < values['min_quantity']:
            raise ValueError('max_quantity must be greater than or equal to min_quantity')
        return v

class Product(ProductBase):
    """
    Schema for product response.
    
    Attributes:
        id (int): Product ID
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ProductInDB(Product):
    """
    Schema for product in database.
    Inherits all fields from Product.
    """
    pass

class ProductList(BaseModel):
    """
    Schema for list of products.
    
    Attributes:
        items (List[Product]): List of products
        total (int): Total number of products
    """
    items: List[Product]
    total: int

class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    filename: str
    url: str
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    name: str
    sku: str
    price_adjustment: float
    stock: int
    attributes: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
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
    created_at: datetime
    images: List[ProductImageResponse]
    variants: List[ProductVariantResponse]

    class Config:
        from_attributes = True 
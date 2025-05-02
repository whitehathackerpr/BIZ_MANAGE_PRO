from typing import Optional, List
from pydantic import BaseModel, constr, confloat, conint
from datetime import datetime
from enum import Enum

class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCONTINUED = "discontinued"
    OUT_OF_STOCK = "out_of_stock"

class ProductCategory(str, Enum):
    RAW_MATERIAL = "raw_material"
    FINISHED_GOOD = "finished_good"
    CONSUMABLE = "consumable"
    EQUIPMENT = "equipment"
    SERVICE = "service"

# Product schemas
class ProductBase(BaseModel):
    name: str
    sku: constr(min_length=3, max_length=50)
    description: Optional[str] = None
    price: confloat(gt=0)
    cost: confloat(ge=0)
    status: ProductStatus = ProductStatus.ACTIVE
    category: ProductCategory
    quantity: conint(ge=0) = 0
    min_quantity: conint(ge=0) = 0
    max_quantity: conint(ge=0) = 0
    unit: Optional[str] = None
    barcode: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None

class ProductCreate(ProductBase):
    business_id: int
    supplier_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[confloat(gt=0)] = None
    cost: Optional[confloat(ge=0)] = None
    status: Optional[ProductStatus] = None
    quantity: Optional[conint(ge=0)] = None
    min_quantity: Optional[conint(ge=0)] = None
    max_quantity: Optional[conint(ge=0)] = None
    supplier_id: Optional[int] = None

class Product(ProductBase):
    id: int
    business_id: int
    supplier_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_stock: int
    profit_margin: float

    class Config:
        from_attributes = True

# Inventory schemas
class InventoryBase(BaseModel):
    product_id: int
    quantity: conint(ge=0)
    minimum_stock: conint(ge=0) = 10
    maximum_stock: conint(ge=0) = 100
    reorder_point: conint(ge=0) = 20
    reorder_quantity: conint(ge=0) = 50
    location: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None

class InventoryCreate(InventoryBase):
    branch_id: int

class InventoryUpdate(BaseModel):
    quantity: Optional[conint(ge=0)] = None
    minimum_stock: Optional[conint(ge=0)] = None
    maximum_stock: Optional[conint(ge=0)] = None
    reorder_point: Optional[conint(ge=0)] = None
    reorder_quantity: Optional[conint(ge=0)] = None
    location: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None

class Inventory(InventoryBase):
    id: int
    branch_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_restock_date: Optional[datetime] = None
    is_low_stock: bool
    needs_restock: bool
    is_expired: bool
    days_until_expiry: Optional[int]

    class Config:
        from_attributes = True

# Stock movement schemas
class StockMovementType(str, Enum):
    IN = "in"
    OUT = "out"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"

class StockMovementBase(BaseModel):
    inventory_id: int
    quantity: conint(ge=0)
    movement_type: StockMovementType
    reference: Optional[str] = None
    notes: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    pass

class StockMovement(StockMovementBase):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True

# Inventory transfer schemas
class InventoryTransferBase(BaseModel):
    source_branch_id: int
    target_branch_id: int
    product_id: int
    quantity: conint(gt=0)

class InventoryTransferCreate(InventoryTransferBase):
    pass

class InventoryTransferStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class InventoryTransfer(InventoryTransferBase):
    id: int
    status: InventoryTransferStatus
    requested_by: int
    approved_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Product with relationships
class ProductWithInventory(Product):
    inventory_items: List[Inventory] = []
    stock_movements: List[StockMovement] = []

    class Config:
        from_attributes = True

class BranchInventoryResponse(BaseModel):
    id: int
    branch_id: int
    product_id: int
    quantity: int
    min_stock_level: int
    max_stock_level: int
    created_at: datetime

    class Config:
        from_attributes = True 
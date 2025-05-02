from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, Numeric, JSON, DateTime, Enum, Table
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from ..extensions import Base
import enum
from typing import List

class ProductStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCONTINUED = "discontinued"
    OUT_OF_STOCK = "out_of_stock"

class ProductCategory(enum.Enum):
    RAW_MATERIAL = "raw_material"
    FINISHED_GOOD = "finished_good"
    CONSUMABLE = "consumable"
    EQUIPMENT = "equipment"
    SERVICE = "service"

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(64), unique=True, nullable=False)
    slug = Column(String(64), unique=True, nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey('categories.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    products = relationship('Product', back_populates='category', foreign_keys='Product.category_id')
    subcategories = relationship(
        'Category',
        backref=backref('parent', remote_side=[id]),
        lazy='dynamic'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'parent_id': self.parent_id,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<Category {self.name}>'

# Association table for customer preferred products
customer_preferred_products = Table(
    'customer_preferred_products',
    Base.metadata,
    Column('customer_id', Integer, ForeignKey('users.id')),
    Column('product_id', Integer, ForeignKey('products.id'))
)

class Product(Base):
    """
    Product model for managing products in the system.
    
    Attributes:
        id (int): Primary key
        name (str): Product name
        sku (str): Stock Keeping Unit
        description (str): Product description
        price (float): Product price
        cost (float): Product cost
        status (ProductStatus): Product status
        category (ProductCategory): Product category
        quantity (int): Current quantity in stock
        min_quantity (int): Minimum quantity threshold
        max_quantity (int): Maximum quantity threshold
        unit (str): Unit of measurement
        barcode (str): Product barcode
        weight (float): Product weight
        dimensions (str): Product dimensions
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
        branch_id (int): Foreign key to branch
        supplier_id (int): Foreign key to supplier
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    supplier_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE)
    category = Column(Enum(ProductCategory), nullable=False)
    quantity = Column(Integer, default=0)
    min_quantity = Column(Integer, default=0)
    max_quantity = Column(Integer, default=0)
    unit = Column(String(20))
    barcode = Column(String(50), unique=True, index=True)
    weight = Column(Float)
    dimensions = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    branch_id = Column(Integer, ForeignKey("branches.id"))
    category_id = Column(Integer, ForeignKey('categories.id'))
    
    # Relationships
    branch = relationship("Branch", back_populates="products")
    supplier = relationship("User", back_populates="supplied_products")
    inventory_items = relationship("Inventory", back_populates="product", cascade='all, delete-orphan')
    preferred_by_customers = relationship("User", secondary=customer_preferred_products)
    sales_items = relationship("SaleItem", back_populates="product")
    business = relationship("Business", back_populates="products")
    category = relationship('Category', back_populates='products', foreign_keys=[category_id])
    
    def __init__(
        self,
        name: str,
        sku: str,
        price: float,
        cost: float,
        category: ProductCategory,
        description: str = None,
        status: ProductStatus = ProductStatus.ACTIVE,
        quantity: int = 0,
        min_quantity: int = 0,
        max_quantity: int = 0,
        unit: str = None,
        barcode: str = None,
        weight: float = None,
        dimensions: str = None,
        business_id: int = None,
        supplier_id: int = None
    ):
        self.name = name
        self.sku = sku
        self.description = description
        self.price = price
        self.cost = cost
        self.status = status
        self.category = category
        self.quantity = quantity
        self.min_quantity = min_quantity
        self.max_quantity = max_quantity
        self.unit = unit
        self.barcode = barcode
        self.weight = weight
        self.dimensions = dimensions
        self.business_id = business_id
        self.supplier_id = supplier_id
    
    def to_dict(self):
        """
        Convert product to dictionary.
        
        Returns:
            dict: Product data
        """
        return {
            'id': self.id,
            'business_id': self.business_id,
            'supplier_id': self.supplier_id,
            'name': self.name,
            'sku': self.sku,
            'description': self.description,
            'price': self.price,
            'cost': self.cost,
            'status': self.status.value,
            'category': self.category.value,
            'quantity': self.quantity,
            'min_quantity': self.min_quantity,
            'max_quantity': self.max_quantity,
            'unit': self.unit,
            'barcode': self.barcode,
            'weight': self.weight,
            'dimensions': self.dimensions,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'total_stock': self.get_total_stock(),
            'profit_margin': self.get_profit_margin()
        }
    
    def update_quantity(self, amount: int) -> bool:
        """
        Update product quantity.
        
        Args:
            amount (int): Amount to add (positive) or subtract (negative)
            
        Returns:
            bool: True if update successful, False otherwise
        """
        new_quantity = self.quantity + amount
        if new_quantity < 0:
            return False
        self.quantity = new_quantity
        return True
    
    def check_stock(self) -> bool:
        """
        Check if product is in stock.
        
        Returns:
            bool: True if in stock, False otherwise
        """
        return self.quantity > 0
    
    def check_low_stock(self) -> bool:
        """
        Check if product quantity is below minimum threshold.
        
        Returns:
            bool: True if low stock, False otherwise
        """
        return self.quantity <= self.min_quantity
    
    def __repr__(self):
        return f'<Product {self.name} ({self.sku})>'

    def get_profit_margin(self) -> float:
        """Calculate profit margin percentage"""
        if self.cost > 0:
            return ((self.price - self.cost) / self.cost) * 100
        return 0

    def get_total_stock(self) -> int:
        """Get total stock across all branches"""
        return sum(item.quantity for item in self.inventory_items)

    def get_stock_by_branch(self, branch_id: int) -> int:
        """Get stock level for a specific branch"""
        inventory_item = next((item for item in self.inventory_items if item.branch_id == branch_id), None)
        return inventory_item.quantity if inventory_item else 0

    def is_low_stock(self, threshold: int = 10) -> bool:
        """Check if product is low in stock"""
        return self.get_total_stock() <= threshold

class ProductImage(Base):
    __tablename__ = 'product_images'
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    filename = Column(String(256), nullable=False)
    url = Column(String(512), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'filename': self.filename,
            'url': self.url,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat()
        }

class ProductVariant(Base):
    __tablename__ = 'product_variants'
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    name = Column(String(128), nullable=False)
    sku = Column(String(32), unique=True, nullable=False)
    price_adjustment = Column(Numeric(10, 2), default=0)
    stock = Column(Integer, default=0)
    attributes = Column(JSON)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'name': self.name,
            'sku': self.sku,
            'price_adjustment': float(self.price_adjustment),
            'stock': self.stock,
            'attributes': self.attributes
        } 
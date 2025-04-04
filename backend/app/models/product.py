from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, Numeric, JSON, DateTime
from sqlalchemy.orm import relationship, backref
from ..extensions import Base

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(64), unique=True, nullable=False)
    slug = Column(String(64), unique=True, nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey('categories.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    products = relationship('Product', backref='category', lazy='dynamic')
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

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey('categories.id'))
    sku = Column(String(32), unique=True)
    barcode = Column(String(32), unique=True)
    weight = Column(Float)
    dimensions = Column(String(50))
    image_url = Column(String(200))
    is_active = Column(Boolean, default=True)
    min_stock_level = Column(Integer, default=10)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = relationship('OrderItem', backref='product', lazy='dynamic')
    sale_items = relationship('SaleItem', backref='product', lazy='dynamic')
    images = relationship('ProductImage', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    variants = relationship('ProductVariant', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    
    @hybrid_property
    def formatted_price(self):
        return f"${self.price:.2f}"
    
    @hybrid_property
    def stock_status(self):
        if self.stock <= 0:
            return "Out of Stock"
        elif self.stock < self.min_stock_level:
            return "Low Stock"
        return "In Stock"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'category_id': self.category_id,
            'sku': self.sku,
            'barcode': self.barcode,
            'weight': self.weight,
            'dimensions': self.dimensions,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'min_stock_level': self.min_stock_level,
            'supplier_id': self.supplier_id,
            'stock_status': self.stock_status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Product {self.name}>'

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
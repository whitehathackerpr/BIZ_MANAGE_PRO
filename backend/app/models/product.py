from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property
from ..extensions import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    slug = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='category', lazy='dynamic')
    subcategories = db.relationship(
        'Category',
        backref=db.backref('parent', remote_side=[id]),
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

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    sku = db.Column(db.String(32), unique=True)
    barcode = db.Column(db.String(32), unique=True)
    weight = db.Column(db.Float)
    dimensions = db.Column(db.String(50))
    image_url = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    min_stock_level = db.Column(db.Integer, default=10)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='product', lazy='dynamic')
    sale_items = db.relationship('SaleItem', backref='product', lazy='dynamic')
    images = db.relationship('ProductImage', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    variants = db.relationship('ProductVariant', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    
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

class ProductImage(db.Model):
    __tablename__ = 'product_images'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    url = db.Column(db.String(512), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'filename': self.filename,
            'url': self.url,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat()
        }

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    sku = db.Column(db.String(32), unique=True, nullable=False)
    price_adjustment = db.Column(db.Numeric(10, 2), default=0)
    stock = db.Column(db.Integer, default=0)
    attributes = db.Column(db.JSON)
    
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
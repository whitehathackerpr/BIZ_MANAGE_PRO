from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.product import Product, Category
from ..schemas.product import ProductCreate, ProductUpdate, ProductSearchParams

class ProductCRUD:
    def get(self, db: Session, id: int) -> Optional[Product]:
        """Get product by id"""
        return db.query(Product).filter(Product.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        category: Optional[str] = None,
        branch_id: Optional[int] = None
    ) -> List[Product]:
        """Get multiple products with optional filters"""
        query = db.query(Product)
        
        if category:
            query = query.join(Product.category).filter(Category.name == category)
        
        if branch_id:
            query = query.filter(Product.branch_id == branch_id)
            
        return query.offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in: ProductCreate) -> Product:
        """Create new product"""
        db_obj = Product(
            name=obj_in.name,
            description=obj_in.description,
            price=obj_in.price,
            sku=obj_in.sku,
            barcode=obj_in.barcode,
            quantity=obj_in.quantity,
            category_id=obj_in.category_id,
            branch_id=obj_in.branch_id,
            supplier_id=obj_in.supplier_id,
            is_active=obj_in.is_active,
            tax_rate=obj_in.tax_rate,
            cost_price=obj_in.cost_price,
            min_stock_level=obj_in.min_stock_level,
            image_url=obj_in.image_url,
            weight=obj_in.weight,
            dimensions=obj_in.dimensions,
            attributes=obj_in.attributes
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, 
        db: Session, 
        *, 
        db_obj: Product, 
        obj_in: Union[ProductUpdate, Dict[str, Any]]
    ) -> Product:
        """Update product"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> Product:
        """Delete product"""
        obj = db.query(Product).get(id)
        db.delete(obj)
        db.commit()
        return obj
    
    def search(
        self, 
        db: Session, 
        *, 
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """Search products by name, sku, or description"""
        search_query = f"%{query}%"
        return db.query(Product).filter(
            or_(
                Product.name.ilike(search_query),
                Product.sku.ilike(search_query),
                Product.description.ilike(search_query),
                Product.barcode.ilike(search_query)
            )
        ).offset(skip).limit(limit).all()
    
    def get_categories(self, db: Session) -> List[str]:
        """Get all product categories"""
        categories = db.query(Category.name).distinct().all()
        return [c[0] for c in categories]
    
    def update_quantity(
        self,
        db: Session,
        *,
        product_id: int,
        quantity_change: int
    ) -> Product:
        """Update product quantity"""
        product = self.get(db, id=product_id)
        if not product:
            return None
            
        product.quantity += quantity_change
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

# Create an instance
product_crud = ProductCRUD() 
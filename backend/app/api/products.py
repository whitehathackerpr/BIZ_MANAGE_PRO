from flask import jsonify, request
from sqlalchemy.orm import Session
from typing import List, Optional
from . import bp
from ..models import Product
from ..schemas.product import ProductCreate, ProductUpdate, ProductResponse
from ..crud.product import product_crud
from ..dependencies import get_db, get_current_user
from ..core.exceptions import NotFoundException

@bp.route('/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    db: Session = get_db()
    skip: int = request.args.get('skip', 0, type=int)
    limit: int = request.args.get('limit', 100, type=int)
    category: Optional[str] = request.args.get('category')
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    
    products = product_crud.get_multi(
        db, skip=skip, limit=limit, 
        category=category, branch_id=branch_id
    )
    return jsonify([ProductResponse.from_orm(p).dict() for p in products])

@bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id: int):
    """Get a specific product by ID"""
    db: Session = get_db()
    product = product_crud.get(db, id=product_id)
    if not product:
        raise NotFoundException(f"Product with ID {product_id} not found")
    return jsonify(ProductResponse.from_orm(product).dict())

@bp.route('/products', methods=['POST'])
def create_product():
    """Create a new product"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    product_in = ProductCreate(**request.json)
    product = product_crud.create(db, obj_in=product_in)
    return jsonify(ProductResponse.from_orm(product).dict()), 201

@bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id: int):
    """Update a product"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    product = product_crud.get(db, id=product_id)
    if not product:
        raise NotFoundException(f"Product with ID {product_id} not found")
    
    product_in = ProductUpdate(**request.json)
    product = product_crud.update(db, db_obj=product, obj_in=product_in)
    return jsonify(ProductResponse.from_orm(product).dict())

@bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id: int):
    """Delete a product"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    product = product_crud.get(db, id=product_id)
    if not product:
        raise NotFoundException(f"Product with ID {product_id} not found")
    
    product_crud.remove(db, id=product_id)
    return jsonify({"message": "Product deleted successfully"})

@bp.route('/products/search', methods=['GET'])
def search_products():
    """Search products by name, SKU, or description"""
    db: Session = get_db()
    query: str = request.args.get('q', '')
    skip: int = request.args.get('skip', 0, type=int)
    limit: int = request.args.get('limit', 100, type=int)
    
    products = product_crud.search(
        db, query=query, skip=skip, limit=limit
    )
    return jsonify([ProductResponse.from_orm(p).dict() for p in products])

@bp.route('/products/categories', methods=['GET'])
def get_product_categories():
    """Get all product categories"""
    db: Session = get_db()
    categories = product_crud.get_categories(db)
    return jsonify(categories)

@bp.route('/products/<int:product_id>/stock', methods=['PUT'])
def update_product_stock(product_id: int):
    """Update product stock quantity"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    quantity: int = request.json.get('quantity')
    if quantity is None:
        return jsonify({"error": "Quantity is required"}), 400
        
    product = product_crud.update_quantity(
        db, product_id=product_id, quantity_change=quantity
    )
    return jsonify(ProductResponse.from_orm(product).dict()) 
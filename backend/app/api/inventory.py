from flask import jsonify, request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import bp
from ..models import InventoryTransaction
from ..schemas.inventory import InventoryTransactionCreate, InventoryTransactionUpdate, InventoryTransactionResponse
from ..crud.inventory import inventory_crud
from ..dependencies import get_db, get_current_user
from ..core.exceptions import NotFoundException

@bp.route('/inventory', methods=['GET'])
def get_inventory():
    return jsonify({'message': 'Inventory endpoint'}), 200 

@bp.route('/inventory/transactions', methods=['GET'])
def get_inventory_transactions():
    """Get all inventory transactions with optional filtering"""
    current_user = get_current_user()
    db: Session = get_db()
    skip: int = request.args.get('skip', 0, type=int)
    limit: int = request.args.get('limit', 100, type=int)
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    product_id: Optional[int] = request.args.get('product_id', type=int)
    transaction_type: Optional[str] = request.args.get('type')
    start_date: Optional[str] = request.args.get('start_date')
    end_date: Optional[str] = request.args.get('end_date')
    
    # Convert string dates to datetime if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    transactions = inventory_crud.get_transactions(
        db, skip=skip, limit=limit,
        branch_id=branch_id,
        product_id=product_id,
        transaction_type=transaction_type,
        start_date=start_dt,
        end_date=end_dt
    )
    return jsonify([InventoryTransactionResponse.from_orm(t).dict() for t in transactions])

@bp.route('/inventory/transactions/<int:transaction_id>', methods=['GET'])
def get_inventory_transaction(transaction_id: int):
    """Get a specific inventory transaction by ID"""
    current_user = get_current_user()
    db: Session = get_db()
    transaction = inventory_crud.get_transaction(db, id=transaction_id)
    
    if not transaction:
        raise NotFoundException(f"Transaction with ID {transaction_id} not found")
    
    # Check if user has access to this transaction
    if not current_user.is_admin and transaction.branch_id != current_user.branch_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    return jsonify(InventoryTransactionResponse.from_orm(transaction).dict())

@bp.route('/inventory/transactions', methods=['POST'])
def create_inventory_transaction():
    """Create a new inventory transaction"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    transaction_in = InventoryTransactionCreate(**request.json)
    transaction = inventory_crud.create_transaction(db, obj_in=transaction_in)
    return jsonify(InventoryTransactionResponse.from_orm(transaction).dict()), 201

@bp.route('/inventory/stock-levels', methods=['GET'])
def get_stock_levels():
    """Get current stock levels for all products"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    category: Optional[str] = request.args.get('category')
    low_stock_only: bool = request.args.get('low_stock_only', False, type=bool)
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    stock_levels = inventory_crud.get_stock_levels(
        db,
        branch_id=branch_id,
        category=category,
        low_stock_only=low_stock_only
    )
    return jsonify(stock_levels)

@bp.route('/inventory/adjust', methods=['POST'])
def adjust_inventory():
    """Adjust inventory levels"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    adjustments = request.json.get('adjustments', [])
    if not adjustments:
        return jsonify({"error": "No adjustments provided"}), 400
    
    results = inventory_crud.bulk_adjust_inventory(db, adjustments=adjustments)
    return jsonify(results)

@bp.route('/inventory/low-stock', methods=['GET'])
def get_low_stock():
    """Get products with low stock"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    low_stock = inventory_crud.get_low_stock(db, branch_id=branch_id)
    return jsonify(low_stock)

@bp.route('/inventory/value', methods=['GET'])
def get_inventory_value():
    """Get total inventory value"""
    current_user = get_current_user()
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
        
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    category: Optional[str] = request.args.get('category')
    
    value = inventory_crud.get_inventory_value(
        db,
        branch_id=branch_id,
        category=category
    )
    return jsonify(value) 
from flask import jsonify, request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import bp
from ..models import Sale
from ..schemas.sale import SaleCreate, SaleUpdate, SaleResponse
from ..crud.sale import sale_crud
from ..dependencies import get_db, get_current_user
from ..core.exceptions import NotFoundException

@bp.route('/sales', methods=['GET'])
def get_sales():
    """Get all sales with optional filtering"""
    current_user = get_current_user()
    db: Session = get_db()
    skip: int = request.args.get('skip', 0, type=int)
    limit: int = request.args.get('limit', 100, type=int)
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    start_date: Optional[str] = request.args.get('start_date')
    end_date: Optional[str] = request.args.get('end_date')
    
    # Convert string dates to datetime if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    sales = sale_crud.get_multi(
        db, skip=skip, limit=limit,
        branch_id=branch_id,
        start_date=start_dt,
        end_date=end_dt
    )
    return jsonify([SaleResponse.from_orm(s).dict() for s in sales])

@bp.route('/sales/<int:sale_id>', methods=['GET'])
def get_sale(sale_id: int):
    """Get a specific sale by ID"""
    current_user = get_current_user()
    db: Session = get_db()
    sale = sale_crud.get(db, id=sale_id)
    
    if not sale:
        raise NotFoundException(f"Sale with ID {sale_id} not found")
    
    # Check if user has access to this sale
    if not current_user.is_admin and sale.branch_id != current_user.branch_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    return jsonify(SaleResponse.from_orm(sale).dict())

@bp.route('/sales', methods=['POST'])
def create_sale():
    """Create a new sale"""
    current_user = get_current_user()
    db: Session = get_db()
    
    # Add current user and branch to sale data
    sale_data = request.json
    sale_data['user_id'] = current_user.id
    if not current_user.is_admin:
        sale_data['branch_id'] = current_user.branch_id
    
    sale_in = SaleCreate(**sale_data)
    sale = sale_crud.create(db, obj_in=sale_in)
    return jsonify(SaleResponse.from_orm(sale).dict()), 201

@bp.route('/sales/<int:sale_id>', methods=['PUT'])
def update_sale(sale_id: int):
    """Update a sale"""
    current_user = get_current_user()
    db: Session = get_db()
    sale = sale_crud.get(db, id=sale_id)
    
    if not sale:
        raise NotFoundException(f"Sale with ID {sale_id} not found")
    
    # Check if user has access to update this sale
    if not current_user.is_admin and sale.branch_id != current_user.branch_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    sale_in = SaleUpdate(**request.json)
    sale = sale_crud.update(db, db_obj=sale, obj_in=sale_in)
    return jsonify(SaleResponse.from_orm(sale).dict())

@bp.route('/sales/<int:sale_id>', methods=['DELETE'])
def delete_sale(sale_id: int):
    """Delete a sale"""
    current_user = get_current_user()
    db: Session = get_db()
    sale = sale_crud.get(db, id=sale_id)
    
    if not sale:
        raise NotFoundException(f"Sale with ID {sale_id} not found")
    
    # Check if user has access to delete this sale
    if not current_user.is_admin and sale.branch_id != current_user.branch_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    sale_crud.remove(db, id=sale_id)
    return jsonify({"message": "Sale deleted successfully"})

@bp.route('/sales/stats', methods=['GET'])
def get_sales_stats():
    """Get sales statistics"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    start_date: Optional[str] = request.args.get('start_date')
    end_date: Optional[str] = request.args.get('end_date')
    
    # Convert string dates to datetime if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    stats = sale_crud.get_stats(
        db,
        branch_id=branch_id,
        start_date=start_dt,
        end_date=end_dt
    )
    return jsonify(stats)

@bp.route('/sales/daily', methods=['GET'])
def get_daily_sales():
    """Get daily sales report"""
    current_user = get_current_user()
    db: Session = get_db()
    branch_id: Optional[int] = request.args.get('branch_id', type=int)
    date: Optional[str] = request.args.get('date')
    
    # Convert string date to datetime if provided
    date_dt = datetime.fromisoformat(date) if date else datetime.now()
    
    # Filter by branch if user is not admin
    if not current_user.is_admin:
        branch_id = current_user.branch_id
    
    daily_sales = sale_crud.get_daily_sales(
        db,
        branch_id=branch_id,
        date=date_dt
    )
    return jsonify(daily_sales) 
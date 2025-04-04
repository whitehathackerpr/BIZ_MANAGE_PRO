from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from ..models import Branch, BranchInventory, User, Sale
from ..services.analytics_service import AnalyticsService
from ..extensions import get_db

router = APIRouter()

# Pydantic models
class BranchBase(BaseModel):
    name: str
    address: str
    phone: str
    email: str
    manager_id: Optional[int] = None
    settings: Optional[dict] = None

class BranchCreate(BranchBase):
    pass

class BranchResponse(BranchBase):
    id: int
    created_at: datetime
    users: List[User]
    inventory: List[BranchInventory]

    class Config:
        from_attributes = True

class BranchInventoryBase(BaseModel):
    product_id: int
    quantity: int
    min_stock_level: int = 10
    max_stock_level: int = 100

class BranchInventoryResponse(BranchInventoryBase):
    id: int
    branch_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    target_branch_id: int
    quantity: int

# Routes
@router.get("/branches", response_model=List[BranchResponse])
async def get_branches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branches = db.query(Branch).all()
    return branches

@router.post("/branches", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
async def create_branch(
    branch: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_branch = Branch(**branch.dict())
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.get("/branches/{branch_id}", response_model=BranchResponse)
async def get_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = db.query(Branch).get(branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    return branch

@router.put("/branches/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: int,
    branch_update: BranchBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_branch = db.query(Branch).get(branch_id)
    if not db_branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    for key, value in branch_update.dict().items():
        setattr(db_branch, key, value)
    
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.delete("/branches/{branch_id}")
async def delete_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = db.query(Branch).get(branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    db.delete(branch)
    db.commit()
    return {"message": "Branch deleted successfully"}

# Branch Inventory Endpoints
@router.get("/branches/{branch_id}/inventory", response_model=List[BranchInventoryResponse])
async def get_branch_inventory(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inventory = db.query(BranchInventory).filter_by(branch_id=branch_id).all()
    return inventory

@router.post("/branches/{branch_id}/inventory", response_model=BranchInventoryResponse, status_code=status.HTTP_201_CREATED)
async def add_branch_inventory(
    branch_id: int,
    inventory: BranchInventoryBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_inventory = BranchInventory(branch_id=branch_id, **inventory.dict())
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory

@router.put("/branches/{branch_id}/inventory/{item_id}", response_model=BranchInventoryResponse)
async def update_branch_inventory(
    branch_id: int,
    item_id: int,
    inventory_update: BranchInventoryBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(BranchInventory).filter_by(branch_id=branch_id, id=item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    for key, value in inventory_update.dict().items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/branches/{branch_id}/inventory/{item_id}")
async def delete_branch_inventory(
    branch_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(BranchInventory).filter_by(branch_id=branch_id, id=item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    db.delete(item)
    db.commit()
    return {"message": "Inventory item deleted successfully"}

# Branch Transfer Endpoints
@router.post("/branches/{branch_id}/inventory/{item_id}/transfer")
async def transfer_inventory(
    branch_id: int,
    item_id: int,
    transfer: TransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    source_item = db.query(BranchInventory).filter_by(branch_id=branch_id, id=item_id).first()
    if not source_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source inventory item not found"
        )
    
    if source_item.quantity < transfer.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient inventory"
        )
    
    # Create or update target branch inventory
    target_item = db.query(BranchInventory).filter_by(
        branch_id=transfer.target_branch_id,
        product_id=source_item.product_id
    ).first()
    
    if target_item:
        target_item.quantity += transfer.quantity
    else:
        target_item = BranchInventory(
            branch_id=transfer.target_branch_id,
            product_id=source_item.product_id,
            quantity=transfer.quantity,
            min_stock_level=source_item.min_stock_level,
            max_stock_level=source_item.max_stock_level
        )
        db.add(target_item)
    
    source_item.quantity -= transfer.quantity
    db.commit()
    return {"message": "Transfer successful"}

# Branch Performance Endpoints
@router.get("/branches/{branch_id}/performance")
async def get_branch_performance(
    branch_id: int,
    time_range: str = Query("week", regex="^(day|week|month|year)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    end_date = datetime.now()
    
    if time_range == "day":
        start_date = end_date - timedelta(days=1)
    elif time_range == "week":
        start_date = end_date - timedelta(weeks=1)
    elif time_range == "month":
        start_date = end_date - timedelta(days=30)
    else:  # year
        start_date = end_date - timedelta(days=365)
    
    # Get sales data
    sales = db.query(Sale).filter(
        Sale.branch_id == branch_id,
        Sale.created_at.between(start_date, end_date)
    ).all()
    
    # Calculate metrics
    revenue = sum(sale.total_amount for sale in sales)
    orders = len(sales)
    average_order_value = revenue / orders if orders > 0 else 0
    
    # Get inventory data
    inventory = db.query(BranchInventory).filter_by(branch_id=branch_id).all()
    inventory_data = [{
        "name": item.product.name,
        "quantity": item.quantity
    } for item in inventory]
    
    # Get top products
    top_products = AnalyticsService.get_top_products(branch_id, start_date, end_date)
    
    # Calculate customer retention
    customer_retention = AnalyticsService.calculate_customer_retention(branch_id, start_date, end_date)
    
    return {
        "revenue": revenue,
        "orders": orders,
        "averageOrderValue": average_order_value,
        "inventory": inventory_data,
        "topProducts": top_products,
        "customerRetention": customer_retention,
        "sales": [{
            "date": sale.created_at.strftime("%Y-%m-%d"),
            "amount": sale.total_amount
        } for sale in sales]
    }

# Branch Settings Endpoints
@router.get("/branches/{branch_id}/settings")
async def get_branch_settings(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = db.query(Branch).get(branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    return branch.settings

@router.put("/branches/{branch_id}/settings")
async def update_branch_settings(
    branch_id: int,
    settings: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = db.query(Branch).get(branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    branch.settings = settings
    db.commit()
    return branch.settings

# Branch Users Endpoints
@router.get("/branches/{branch_id}/users", response_model=List[User])
async def get_branch_users(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter_by(branch_id=branch_id).all()
    return users

@router.post("/branches/{branch_id}/users/{user_id}")
async def assign_user_to_branch(
    branch_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.branch_id = branch_id
    db.commit()
    return {"message": "User assigned to branch successfully"}

@router.delete("/branches/{branch_id}/users/{user_id}")
async def remove_user_from_branch(
    branch_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).get(user_id)
    if not user or user.branch_id != branch_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in this branch"
        )
    
    user.branch_id = None
    db.commit()
    return {"message": "User removed from branch successfully"} 
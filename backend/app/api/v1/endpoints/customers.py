from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.User)
def create_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new customer.
    """
    if not current_user.has_permission("manage_customers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    # Force role to be customer
    customer_in.role = models.UserRole.CUSTOMER
    customer = crud.user.create(db=db, obj_in=customer_in)
    return customer

@router.get("/", response_model=List[schemas.User])
def get_customers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: str = Query(None, min_length=3),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve customers.
    """
    if not current_user.has_permission("view_customers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    customers = crud.user.get_customers(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )
    return customers

@router.get("/{customer_id}", response_model=schemas.UserWithDetails)
def get_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get customer by ID.
    """
    if not current_user.has_permission("view_customers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    customer = crud.user.get(db=db, id=customer_id)
    if not customer or customer.role != models.UserRole.CUSTOMER:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    return customer

@router.put("/{customer_id}", response_model=schemas.User)
def update_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int,
    customer_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update customer.
    """
    if not current_user.has_permission("manage_customers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    customer = crud.user.get(db=db, id=customer_id)
    if not customer or customer.role != models.UserRole.CUSTOMER:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    
    customer = crud.user.update(db=db, db_obj=customer, obj_in=customer_in)
    return customer

@router.delete("/{customer_id}", response_model=schemas.User)
def delete_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete customer.
    """
    if not current_user.has_permission("manage_customers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    customer = crud.user.get(db=db, id=customer_id)
    if not customer or customer.role != models.UserRole.CUSTOMER:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    
    customer = crud.user.remove(db=db, id=customer_id)
    return customer

@router.get("/{customer_id}/orders", response_model=List[schemas.Order])
def get_customer_orders(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get customer orders.
    """
    if not current_user.has_permission("view_customer_orders"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    customer = crud.user.get(db=db, id=customer_id)
    if not customer or customer.role != models.UserRole.CUSTOMER:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    
    orders = crud.order.get_customer_orders(
        db=db,
        customer_id=customer_id,
        skip=skip,
        limit=limit
    )
    return orders

@router.get("/{customer_id}/transactions", response_model=List[schemas.Transaction])
def get_customer_transactions(
    *,
    db: Session = Depends(deps.get_db),
    customer_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get customer transactions.
    """
    if not current_user.has_permission("view_customer_transactions"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    customer = crud.user.get(db=db, id=customer_id)
    if not customer or customer.role != models.UserRole.CUSTOMER:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )
    
    transactions = crud.transaction.get_customer_transactions(
        db=db,
        customer_id=customer_id,
        skip=skip,
        limit=limit
    )
    return transactions 
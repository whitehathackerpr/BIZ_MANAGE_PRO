from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.api.v1.endpoints.firebase import broadcast_notification

router = APIRouter()

# Sales Management Endpoints

@router.post("/transactions/", response_model=schemas.Transaction)
async def create_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_in: schemas.TransactionCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new transaction.
    """
    if not current_user.has_permission("process_sales"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    transaction = crud.transaction.create_with_items(
        db=db, obj_in=transaction_in, cashier_id=current_user.id
    )
    await broadcast_notification(f"New sale created by {current_user.email} for {transaction.total}!")
    return transaction

@router.get("/transactions/", response_model=List[schemas.Transaction])
def get_transactions(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve transactions.
    """
    if current_user.role == models.UserRole.OWNER:
        transactions = crud.transaction.get_multi(db=db, skip=skip, limit=limit)
    else:
        transactions = crud.transaction.get_multi_by_user(
            db=db, user_id=current_user.id, skip=skip, limit=limit
        )
    return transactions

@router.get("/transactions/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get transaction by ID.
    """
    transaction = crud.transaction.get(db=db, id=transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )
    if not crud.transaction.can_access(
        db, transaction_id=transaction_id, user_id=current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    return transaction

@router.put("/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    transaction_in: schemas.TransactionUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update transaction.
    """
    if not current_user.has_permission("process_sales"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    transaction = crud.transaction.get(db=db, id=transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )
    transaction = crud.transaction.update(
        db=db, db_obj=transaction, obj_in=transaction_in
    )
    return transaction

@router.post("/transactions/{transaction_id}/complete", response_model=schemas.Transaction)
def complete_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Complete a transaction.
    """
    if not current_user.has_permission("process_sales"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    transaction = crud.transaction.complete(db=db, id=transaction_id)
    return transaction

@router.post("/transactions/{transaction_id}/cancel", response_model=schemas.Transaction)
def cancel_transaction(
    *,
    db: Session = Depends(deps.get_db),
    transaction_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Cancel a transaction.
    """
    if not current_user.has_permission("process_sales"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    transaction = crud.transaction.cancel(db=db, id=transaction_id)
    return transaction

# Order Management Endpoints

@router.post("/orders/", response_model=schemas.Order)
async def create_order(
    *,
    db: Session = Depends(deps.get_db),
    order_in: schemas.OrderCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new order.
    """
    if not current_user.has_permission("manage_orders"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    order = crud.order.create_with_items(
        db=db, obj_in=order_in, user_id=current_user.id
    )
    await broadcast_notification(f"New order created by {current_user.email}!")
    return order

@router.get("/orders/", response_model=List[schemas.Order])
def get_orders(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve orders.
    """
    if current_user.role == models.UserRole.OWNER:
        orders = crud.order.get_multi(db=db, skip=skip, limit=limit)
    else:
        orders = crud.order.get_multi_by_user(
            db=db, user_id=current_user.id, skip=skip, limit=limit
        )
    return orders

@router.get("/orders/{order_id}", response_model=schemas.Order)
def get_order(
    *,
    db: Session = Depends(deps.get_db),
    order_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get order by ID.
    """
    order = crud.order.get(db=db, id=order_id)
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )
    if not crud.order.can_access(db, order_id=order_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    return order

@router.put("/orders/{order_id}", response_model=schemas.Order)
def update_order(
    *,
    db: Session = Depends(deps.get_db),
    order_id: int,
    order_in: schemas.OrderUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update order.
    """
    if not current_user.has_permission("manage_orders"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    order = crud.order.get(db=db, id=order_id)
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )
    order = crud.order.update(db=db, db_obj=order, obj_in=order_in)
    return order

@router.post("/orders/{order_id}/process", response_model=schemas.Order)
def process_order(
    *,
    db: Session = Depends(deps.get_db),
    order_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Process an order.
    """
    if not current_user.has_permission("manage_orders"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    order = crud.order.process(db=db, id=order_id)
    return order

@router.post("/orders/{order_id}/cancel", response_model=schemas.Order)
def cancel_order(
    *,
    db: Session = Depends(deps.get_db),
    order_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Cancel an order.
    """
    if not current_user.has_permission("manage_orders"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    order = crud.order.cancel(db=db, id=order_id)
    return order 
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

# Product Management Endpoints

@router.post("/products/", response_model=schemas.Product)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
    product_in: schemas.ProductCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new product.
    """
    if not current_user.has_permission("manage_products"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    product = crud.product.create(db=db, obj_in=product_in)
    return product

@router.get("/products/", response_model=List[schemas.Product])
def get_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve products.
    """
    products = crud.product.get_multi(db=db, skip=skip, limit=limit)
    return products

@router.get("/products/{product_id}", response_model=schemas.Product)
def get_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get product by ID.
    """
    product = crud.product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )
    return product

@router.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    product_in: schemas.ProductUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update product.
    """
    if not current_user.has_permission("manage_products"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    product = crud.product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )
    product = crud.product.update(db=db, db_obj=product, obj_in=product_in)
    return product

@router.delete("/products/{product_id}", response_model=schemas.Product)
def delete_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete product.
    """
    if not current_user.has_permission("manage_products"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    product = crud.product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )
    product = crud.product.remove(db=db, id=product_id)
    return product

# Inventory Management Endpoints

@router.get("/stock/{branch_id}", response_model=List[schemas.Inventory])
def get_branch_inventory(
    *,
    db: Session = Depends(deps.get_db),
    branch_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get inventory for a specific branch.
    """
    if not current_user.can_access_branch(branch_id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    inventory = crud.inventory.get_multi_by_branch(
        db=db, branch_id=branch_id, skip=skip, limit=limit
    )
    return inventory

@router.post("/stock/{branch_id}", response_model=schemas.Inventory)
def add_stock(
    *,
    db: Session = Depends(deps.get_db),
    branch_id: int,
    stock_in: schemas.InventoryCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Add stock to branch inventory.
    """
    if not current_user.has_permission("manage_stock"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    inventory = crud.inventory.create_with_branch(
        db=db, obj_in=stock_in, branch_id=branch_id
    )
    return inventory

@router.put("/stock/{branch_id}/{inventory_id}", response_model=schemas.Inventory)
def update_stock(
    *,
    db: Session = Depends(deps.get_db),
    branch_id: int,
    inventory_id: int,
    stock_in: schemas.InventoryUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update stock quantity.
    """
    if not current_user.has_permission("manage_stock"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    inventory = crud.inventory.get(db=db, id=inventory_id)
    if not inventory or inventory.branch_id != branch_id:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found",
        )
    inventory = crud.inventory.update(db=db, db_obj=inventory, obj_in=stock_in)
    return inventory

@router.get("/stock/low", response_model=List[schemas.Inventory])
def get_low_stock(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all low stock items across accessible branches.
    """
    if current_user.role == models.UserRole.OWNER:
        inventory = crud.inventory.get_low_stock_all(db=db)
    else:
        inventory = crud.inventory.get_low_stock_by_user(db=db, user_id=current_user.id)
    return inventory

@router.post("/stock/transfer", response_model=schemas.InventoryTransfer)
def transfer_stock(
    *,
    db: Session = Depends(deps.get_db),
    transfer_in: schemas.InventoryTransferCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Transfer stock between branches.
    """
    if not current_user.has_permission("manage_stock"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    if not (current_user.can_access_branch(transfer_in.source_branch_id) and 
            current_user.can_access_branch(transfer_in.target_branch_id)):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions for one or both branches",
        )
    transfer = crud.inventory.create_transfer(
        db=db, obj_in=transfer_in, user_id=current_user.id
    )
    return transfer

@router.get("/stock/transfers", response_model=List[schemas.InventoryTransfer])
def get_stock_transfers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get stock transfer history.
    """
    if current_user.role == models.UserRole.OWNER:
        transfers = crud.inventory.get_transfers_all(db=db, skip=skip, limit=limit)
    else:
        transfers = crud.inventory.get_transfers_by_user(
            db=db, user_id=current_user.id, skip=skip, limit=limit
        )
    return transfers 
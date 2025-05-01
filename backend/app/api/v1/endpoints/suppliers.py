from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.User)
def create_supplier(
    *,
    db: Session = Depends(deps.get_db),
    supplier_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new supplier.
    """
    if not current_user.has_permission("manage_suppliers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    # Force role to be supplier
    supplier_in.role = models.UserRole.SUPPLIER
    supplier = crud.user.create(db=db, obj_in=supplier_in)
    return supplier

@router.get("/", response_model=List[schemas.User])
def get_suppliers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: str = Query(None, min_length=3),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve suppliers.
    """
    if not current_user.has_permission("view_suppliers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    suppliers = crud.user.get_suppliers(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )
    return suppliers

@router.get("/{supplier_id}", response_model=schemas.UserWithDetails)
def get_supplier(
    *,
    db: Session = Depends(deps.get_db),
    supplier_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get supplier by ID.
    """
    if not current_user.has_permission("view_suppliers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    supplier = crud.user.get(db=db, id=supplier_id)
    if not supplier or supplier.role != models.UserRole.SUPPLIER:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )
    return supplier

@router.put("/{supplier_id}", response_model=schemas.User)
def update_supplier(
    *,
    db: Session = Depends(deps.get_db),
    supplier_id: int,
    supplier_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update supplier.
    """
    if not current_user.has_permission("manage_suppliers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    supplier = crud.user.get(db=db, id=supplier_id)
    if not supplier or supplier.role != models.UserRole.SUPPLIER:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )
    
    supplier = crud.user.update(db=db, db_obj=supplier, obj_in=supplier_in)
    return supplier

@router.delete("/{supplier_id}", response_model=schemas.User)
def delete_supplier(
    *,
    db: Session = Depends(deps.get_db),
    supplier_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete supplier.
    """
    if not current_user.has_permission("manage_suppliers"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    supplier = crud.user.get(db=db, id=supplier_id)
    if not supplier or supplier.role != models.UserRole.SUPPLIER:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )
    
    supplier = crud.user.remove(db=db, id=supplier_id)
    return supplier

@router.get("/{supplier_id}/products", response_model=List[schemas.Product])
def get_supplier_products(
    *,
    db: Session = Depends(deps.get_db),
    supplier_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get products supplied by supplier.
    """
    if not current_user.has_permission("view_supplier_products"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    supplier = crud.user.get(db=db, id=supplier_id)
    if not supplier or supplier.role != models.UserRole.SUPPLIER:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )
    
    products = crud.product.get_supplier_products(
        db=db,
        supplier_id=supplier_id,
        skip=skip,
        limit=limit
    )
    return products

@router.post("/{supplier_id}/products", response_model=schemas.Product)
def create_supplier_product(
    *,
    db: Session = Depends(deps.get_db),
    supplier_id: int,
    product_in: schemas.ProductCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new product for supplier.
    """
    if not current_user.has_permission("manage_supplier_products"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    supplier = crud.user.get(db=db, id=supplier_id)
    if not supplier or supplier.role != models.UserRole.SUPPLIER:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )
    
    product = crud.product.create_with_supplier(
        db=db,
        obj_in=product_in,
        supplier_id=supplier_id
    )
    return product 
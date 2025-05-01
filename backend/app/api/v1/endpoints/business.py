from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Business)
def create_business(
    *,
    db: Session = Depends(deps.get_db),
    business_in: schemas.BusinessCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new business.
    """
    if not current_user.has_permission("create_business"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    business = crud.business.create_with_owner(
        db=db, obj_in=business_in, owner_id=current_user.id
    )
    return business

@router.get("/", response_model=List[schemas.Business])
def get_businesses(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve businesses.
    """
    if current_user.role == models.UserRole.OWNER:
        businesses = crud.business.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    else:
        businesses = crud.business.get_multi_by_user(
            db=db, user_id=current_user.id, skip=skip, limit=limit
        )
    return businesses

@router.get("/{business_id}", response_model=schemas.Business)
def get_business(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get business by ID.
    """
    business = crud.business.get(db=db, id=business_id)
    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )
    if not crud.business.can_access(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    return business

@router.put("/{business_id}", response_model=schemas.Business)
def update_business(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    business_in: schemas.BusinessUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update business.
    """
    business = crud.business.get(db=db, id=business_id)
    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )
    if not crud.business.can_manage(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    business = crud.business.update(db=db, db_obj=business, obj_in=business_in)
    return business

@router.delete("/{business_id}", response_model=schemas.Business)
def delete_business(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete business.
    """
    business = crud.business.get(db=db, id=business_id)
    if not business:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )
    if not crud.business.can_manage(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    business = crud.business.remove(db=db, id=business_id)
    return business

# Branch Management Endpoints

@router.post("/{business_id}/branches/", response_model=schemas.Branch)
def create_branch(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    branch_in: schemas.BranchCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new branch for business.
    """
    if not crud.business.can_manage(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    branch = crud.branch.create_with_business(
        db=db, obj_in=branch_in, business_id=business_id
    )
    return branch

@router.get("/{business_id}/branches/", response_model=List[schemas.Branch])
def get_branches(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get all branches for business.
    """
    if not crud.business.can_access(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    branches = crud.branch.get_multi_by_business(
        db=db, business_id=business_id, skip=skip, limit=limit
    )
    return branches

@router.get("/{business_id}/branches/{branch_id}", response_model=schemas.Branch)
def get_branch(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    branch_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get branch by ID.
    """
    if not crud.business.can_access(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    branch = crud.branch.get(db=db, id=branch_id)
    if not branch or branch.business_id != business_id:
        raise HTTPException(
            status_code=404,
            detail="Branch not found",
        )
    return branch

@router.put("/{business_id}/branches/{branch_id}", response_model=schemas.Branch)
def update_branch(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    branch_id: int,
    branch_in: schemas.BranchUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update branch.
    """
    if not crud.business.can_manage(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    branch = crud.branch.get(db=db, id=branch_id)
    if not branch or branch.business_id != business_id:
        raise HTTPException(
            status_code=404,
            detail="Branch not found",
        )
    branch = crud.branch.update(db=db, db_obj=branch, obj_in=branch_in)
    return branch

@router.delete("/{business_id}/branches/{branch_id}", response_model=schemas.Branch)
def delete_branch(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    branch_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete branch.
    """
    if not crud.business.can_manage(db, business_id=business_id, user_id=current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    branch = crud.branch.get(db=db, id=branch_id)
    if not branch or branch.business_id != business_id:
        raise HTTPException(
            status_code=404,
            detail="Branch not found",
        )
    branch = crud.branch.remove(db=db, id=branch_id)
    return branch 
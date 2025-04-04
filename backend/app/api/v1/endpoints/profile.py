from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ....core.logging import logger
from ....dependencies import get_db, get_current_user
from ....models.user import User
from ....schemas.profile import ProfileCreate, ProfileUpdate, Profile
from ....crud import profile as crud_profile

router = APIRouter()

@router.get("/me", response_model=Profile)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get current user's profile.
    """
    profile = crud_profile.get_by_user_id(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.put("/me", response_model=Profile)
async def update_my_profile(
    *,
    db: Session = Depends(get_db),
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update current user's profile.
    """
    profile = crud_profile.get_by_user_id(db, user_id=current_user.id)
    if not profile:
        profile = crud_profile.create(db, obj_in=ProfileCreate(user_id=current_user.id))
    
    profile = crud_profile.update(db, db_obj=profile, obj_in=profile_in)
    logger.info(f"User {current_user.email} updated their profile")
    return profile 
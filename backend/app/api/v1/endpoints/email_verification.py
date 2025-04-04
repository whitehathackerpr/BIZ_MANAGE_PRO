from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ....core.logging import logger
from ....core.security import create_verification_token, verify_verification_token
from ....dependencies import get_db
from ....crud import user as crud_user
from ....core.email import email_service

router = APIRouter()

@router.post("/send-verification")
async def send_verification_email(
    email: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Send email verification link.
    """
    user = crud_user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    verification_token = create_verification_token(user.id)
    email_service.send_verification_email(user.email, verification_token)
    logger.info(f"Verification email sent to {user.email}")
    return {"message": "Verification email sent"}

@router.post("/verify")
async def verify_email(
    token: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Verify email with token.
    """
    user_id = verify_verification_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    user = crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    user = crud_user.update(
        db,
        db_obj=user,
        obj_in={"is_verified": True}
    )
    logger.info(f"Email verified for user {user.email}")
    return {"message": "Email verified successfully"} 
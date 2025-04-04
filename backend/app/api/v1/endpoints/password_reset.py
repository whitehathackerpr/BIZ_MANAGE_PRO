from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ....core.logging import logger
from ....core.security import create_password_reset_token, verify_password_reset_token
from ....dependencies import get_db
from ....crud import user as crud_user
from ....core.email import email_service
from ....schemas.user import UserCreate

router = APIRouter()

@router.post("/request-reset")
async def request_password_reset(
    email: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Request password reset.
    """
    user = crud_user.get_by_email(db, email=email)
    if not user:
        # Don't reveal if user exists
        return {"message": "If your email is registered, you will receive a password reset link."}
    
    reset_token = create_password_reset_token(user.id)
    email_service.send_password_reset_email(user.email, reset_token)
    logger.info(f"Password reset requested for user {user.email}")
    return {"message": "If your email is registered, you will receive a password reset link."}

@router.post("/reset")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password with token.
    """
    user_id = verify_password_reset_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    user = crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = crud_user.update(
        db,
        db_obj=user,
        obj_in={"password": new_password}
    )
    logger.info(f"Password reset for user {user.email}")
    return {"message": "Password has been reset successfully"} 
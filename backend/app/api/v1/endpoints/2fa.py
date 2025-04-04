from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ....core.logging import logger
from ....dependencies import get_db, get_current_user
from ....models.user import User
from ....core.two_factor_auth import two_factor_auth
from ....crud import user as crud_user

router = APIRouter()

@router.post("/setup")
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Setup 2FA for the current user.
    """
    if current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already set up"
        )
    
    secret = two_factor_auth.generate_secret()
    user = crud_user.update(
        db,
        db_obj=current_user,
        obj_in={"two_factor_secret": secret}
    )
    
    qr_code = two_factor_auth.generate_qr_code(secret, current_user.email)
    logger.info(f"2FA setup initiated for user {current_user.email}")
    
    return StreamingResponse(
        qr_code,
        media_type="image/png",
        headers={
            "X-2FA-Secret": secret  # For manual entry if QR code scanning fails
        }
    )

@router.post("/verify-setup")
async def verify_2fa_setup(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Verify 2FA setup with a token.
    """
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not set up"
        )
    
    if not two_factor_auth.verify_token(current_user.two_factor_secret, token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    
    user = crud_user.update(
        db,
        db_obj=current_user,
        obj_in={"is_2fa_enabled": True}
    )
    logger.info(f"2FA setup completed for user {current_user.email}")
    return {"message": "2FA setup completed successfully"}

@router.post("/disable")
async def disable_2fa(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Disable 2FA for the current user.
    """
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not set up"
        )
    
    if not two_factor_auth.verify_token(current_user.two_factor_secret, token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    
    user = crud_user.update(
        db,
        db_obj=current_user,
        obj_in={
            "is_2fa_enabled": False,
            "two_factor_secret": None
        }
    )
    logger.info(f"2FA disabled for user {current_user.email}")
    return {"message": "2FA disabled successfully"} 
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from ..models import Customer
from ..models.feedback import CustomerFeedback
from ..extensions import get_db

router = APIRouter()

# Feedback Schemas
class CustomerFeedbackBase(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None

class CustomerFeedbackCreate(CustomerFeedbackBase):
    pass

class CustomerFeedbackResponse(CustomerFeedbackBase):
    id: int
    customer_id: int
    created_at: datetime
    class Config:
        orm_mode = True

# Loyalty Schema
class LoyaltyResponse(BaseModel):
    loyalty_points: int

# Feedback Endpoints
@router.post("/customers/{customer_id}/feedback", response_model=CustomerFeedbackResponse)
async def create_feedback(
    customer_id: int,
    feedback: CustomerFeedbackCreate,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    feedback_obj = CustomerFeedback(
        customer_id=customer_id,
        product_id=feedback.product_id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_at=datetime.utcnow()
    )
    db.add(feedback_obj)
    db.commit()
    db.refresh(feedback_obj)
    return feedback_obj

@router.get("/customers/{customer_id}/feedback", response_model=List[CustomerFeedbackResponse])
async def get_feedback(
    customer_id: int,
    db: Session = Depends(get_db)
):
    feedbacks = db.query(CustomerFeedback).filter_by(customer_id=customer_id).all()
    return feedbacks

# Loyalty Endpoints
@router.get("/customers/{customer_id}/loyalty", response_model=LoyaltyResponse)
async def get_loyalty_points(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"loyalty_points": customer.loyalty_points}

@router.post("/customers/{customer_id}/loyalty", response_model=LoyaltyResponse)
async def update_loyalty_points(
    customer_id: int,
    points: int,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).get(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.loyalty_points += points
    db.commit()
    return {"loyalty_points": customer.loyalty_points} 
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.feedback import CustomerFeedback
from app.models.user import User
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.product import ProductList
from app.api.v1.endpoints.firebase import broadcast_notification

router = APIRouter()

@router.post("/product-review")
def submit_product_review(
    product_id: int,
    rating: int,
    comment: str = "",
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Assume current_user is a customer
    customer = db.query(Customer).filter(Customer.email == current_user.email).first()
    if not customer:
        raise HTTPException(status_code=400, detail="User is not a customer")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    feedback = CustomerFeedback(
        customer_id=customer.id,
        product_id=product_id,
        rating=rating,
        comment=comment
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    # Trigger notification
    import asyncio
    asyncio.create_task(broadcast_notification(f"New review submitted for {product.name} by {current_user.email}!"))
    return {"success": True, "feedback_id": feedback.id} 
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from app.api import deps
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.feedback import CustomerFeedback
from app.schemas.product import ProductList
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/customer/{customer_id}", response_model=ProductList)
def get_customer_recommendations(customer_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    """
    Recommend products using collaborative filtering, time decay, ratings, and trending fallback.
    """
    # 1. Get products purchased by this customer
    purchased_product_ids = (
        db.query(SaleItem.product_id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.customer_id == customer_id)
        .distinct()
        .all()
    )
    purchased_product_ids = [pid for (pid,) in purchased_product_ids]
    # 2. Find other customers who bought these products
    other_customer_ids = (
        db.query(Sale.customer_id)
        .join(SaleItem, Sale.id == SaleItem.sale_id)
        .filter(SaleItem.product_id.in_(purchased_product_ids), Sale.customer_id != customer_id)
        .distinct()
        .all()
    )
    other_customer_ids = [cid for (cid,) in other_customer_ids]
    # 3. Find products bought by those customers, excluding already purchased
    now = datetime.utcnow()
    decay_days = 30
    score_expr = func.sum(
        SaleItem.quantity * case(
            [(Sale.created_at != None, 0.5 ** ((func.extract('epoch', func.age(now, Sale.created_at)) / 86400) / decay_days))],
            else_=1.0
        )
    )
    # Join with average rating
    avg_rating = func.coalesce(func.avg(CustomerFeedback.rating), 0)
    recommended_products = (
        db.query(Product, score_expr.label('score'), avg_rating.label('avg_rating'))
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .outerjoin(CustomerFeedback, CustomerFeedback.product_id == Product.id)
        .filter(Sale.customer_id.in_(other_customer_ids), ~Product.id.in_(purchased_product_ids))
        .group_by(Product.id)
        .order_by(desc('score' + 0.2 * avg_rating))
        .limit(5)
        .all()
    )
    items = []
    for product, score, avg_rating in recommended_products:
        d = product.to_dict()
        d['recommendation_score'] = float(score) + 0.2 * float(avg_rating)
        d['avg_rating'] = float(avg_rating)
        items.append(d)
    # 4. Fallback: trending products if no recommendations
    if not items:
        trending = (
            db.query(Product, func.sum(SaleItem.quantity).label('score'), avg_rating.label('avg_rating'))
            .join(SaleItem, SaleItem.product_id == Product.id)
            .outerjoin(CustomerFeedback, CustomerFeedback.product_id == Product.id)
            .group_by(Product.id)
            .order_by(desc('score' + 0.2 * avg_rating))
            .limit(5)
            .all()
        )
        for product, score, avg_rating in trending:
            d = product.to_dict()
            d['recommendation_score'] = float(score) + 0.2 * float(avg_rating)
            d['avg_rating'] = float(avg_rating)
            items.append(d)
    return {"items": items, "total": len(items)}

@router.get("/supplier/{supplier_id}", response_model=ProductList)
def get_supplier_recommendations(supplier_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    """
    Recommend top 5 products supplied by the supplier (by sales quantity, with time decay and ratings).
    """
    now = datetime.utcnow()
    decay_days = 30
    avg_rating = func.coalesce(func.avg(CustomerFeedback.rating), 0)
    score_expr = func.sum(
        SaleItem.quantity * case(
            [(Sale.created_at != None, 0.5 ** ((func.extract('epoch', func.age(now, Sale.created_at)) / 86400) / decay_days))],
            else_=1.0
        )
    )
    top_products = (
        db.query(Product, score_expr.label('score'), avg_rating.label('avg_rating'))
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .outerjoin(CustomerFeedback, CustomerFeedback.product_id == Product.id)
        .filter(Product.supplier_id == supplier_id)
        .group_by(Product.id)
        .order_by(desc('score' + 0.2 * avg_rating))
        .limit(5)
        .all()
    )
    items = []
    for product, score, avg_rating in top_products:
        d = product.to_dict()
        d['recommendation_score'] = float(score) + 0.2 * float(avg_rating)
        d['avg_rating'] = float(avg_rating)
        items.append(d)
    return {"items": items, "total": len(items)} 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.api import deps
from app.models.user import User
from app.models.product import Product
from app.services.ml_service import MLService
from app.db.session import get_db

router = APIRouter()

@router.get("/sales-prediction/{business_id}")
def predict_sales(
    business_id: int, 
    days: int = 7,
    db: Session = Depends(get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    """
    Predict sales for the next N days using historical data
    """
    # Check authorization - only business owners or admins
    if current_user.role != "owner" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access sales predictions"
        )
    
    # Generate predictions
    predictions = MLService.predict_sales(db, business_id, days_ahead=days)
    
    return {
        "business_id": business_id,
        "days_predicted": days,
        "predictions": predictions
    }

@router.get("/inventory-prediction/{product_id}")
def predict_inventory(
    product_id: int,
    days: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Predict inventory needs for a specific product
    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Generate prediction
    prediction = MLService.predict_inventory_needs(db, product_id, days_ahead=days)
    
    return prediction

@router.get("/financial-forecast/{business_id}")
def financial_forecast(
    business_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Generate financial forecast for a business
    """
    # Check authorization - only business owners or admins
    if current_user.role != "owner" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access financial forecasts"
        )
    
    # Generate forecast
    forecast = MLService.financial_forecast(db, business_id, days_ahead=days)
    
    if "error" in forecast:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=forecast["error"]
        )
    
    return {
        "business_id": business_id,
        "days_forecast": days,
        "forecast": forecast
    }

@router.get("/dashboard-analytics/{business_id}")
def dashboard_analytics(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get combined analytics for dashboard display
    """
    # Check authorization
    if current_user.role != "owner" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access dashboard analytics"
        )
    
    # Get sales prediction (next 7 days)
    sales_predictions = MLService.predict_sales(db, business_id, days_ahead=7)
    
    # Get financial forecast (next 30 days)
    financial = MLService.financial_forecast(db, business_id, days_ahead=30)
    
    # Get low stock products
    # This would need to be implemented - for now return placeholder
    low_stock_products = [
        {
            "product_id": 1,
            "product_name": "Example Product",
            "current_stock": 5,
            "days_until_stockout": 3,
            "reorder_recommendation": True
        }
    ]
    
    return {
        "business_id": business_id,
        "sales_prediction": {
            "next_7_days": sum(p["predicted_sales"] for p in sales_predictions),
            "confidence": sales_predictions[0]["confidence"] if sales_predictions else 0,
            "daily": sales_predictions
        },
        "financial_forecast": {
            "next_30_days_revenue": financial.get("total_predicted_revenue", 0),
            "confidence": financial.get("confidence", 0)
        },
        "inventory_alerts": {
            "low_stock_count": len(low_stock_products),
            "products": low_stock_products
        }
    } 
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.sale import Sale
import numpy as np
import os
import joblib
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression

router = APIRouter()

MODEL_PATH = "sales_forecast_model.pkl"

@router.get("/predictive/stock")
def stock_prediction(business_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    """
    Predictive analytics for stock (placeholder).
    """
    # TODO: Replace with real ML model
    return {"predicted_stock": 100, "confidence": 0.8}

@router.get("/predictive/financial")
def financial_forecast(business_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    """
    Financial forecast using AI/ML (scikit-learn linear regression on sales).
    """
    # Get sales data for the business (last 90 days)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=90)
    sales = db.query(Sale).filter(Sale.created_at >= start_date, Sale.created_at <= end_date).all()
    if not sales or len(sales) < 10:
        return {"error": "Not enough sales data for prediction"}
    # Prepare data: X = days since start, y = total_amount
    sales_sorted = sorted(sales, key=lambda s: s.created_at)
    X = np.array([(s.created_at - start_date).days for s in sales_sorted]).reshape(-1, 1)
    y = np.array([s.total_amount for s in sales_sorted])
    # Train or load model
    if not os.path.exists(MODEL_PATH):
        model = LinearRegression()
        model.fit(X, y)
        joblib.dump(model, MODEL_PATH)
    else:
        model = joblib.load(MODEL_PATH)
    # Predict for next 7 days
    future_days = np.array([[(sales_sorted[-1].created_at - start_date).days + i] for i in range(1, 8)])
    predictions = model.predict(future_days)
    return {
        "predicted_revenue_next_7_days": predictions.tolist(),
        "confidence": float(model.score(X, y)),
    } 
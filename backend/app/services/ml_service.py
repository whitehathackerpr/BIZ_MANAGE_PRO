from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import random
import os

class MLService:
    @staticmethod
    def predict_sales(db: Session, business_id: int, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """
        Stub implementation for sales prediction - returns mock data
        """
        # Generate placeholder predictions
        end_date = datetime.utcnow()
        future_dates = [end_date + timedelta(days=i+1) for i in range(days_ahead)]
        
        # Mock predictions with random values
        predictions = []
        base_sales = random.randint(1000, 5000)
        
        for date in future_dates:
            # Add some variation based on weekday (weekends have higher sales)
            weekday = date.weekday()
            modifier = 1.3 if weekday >= 5 else 1.0  # Weekend boost
            
            # Random fluctuation
            fluctuation = random.uniform(0.8, 1.2)
            
            predicted_sales = base_sales * modifier * fluctuation
            
            predictions.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_sales": round(predicted_sales, 2),
                "confidence": round(random.uniform(0.7, 0.9), 2)
            })
        
        return predictions
    
    @staticmethod
    def predict_inventory_needs(db: Session, product_id: int, days_ahead: int = 14) -> Dict[str, Any]:
        """
        Stub implementation for inventory prediction - returns mock data
        """
        # Mock current stock
        current_stock = random.randint(50, 200)
        
        # Mock average daily sales
        avg_daily_sales = random.uniform(5, 15)
        
        # Calculate days until stockout
        days_until_stockout = current_stock / avg_daily_sales if avg_daily_sales > 0 else 30
        
        # Generate daily sales predictions
        predicted_daily_sales = [
            round(avg_daily_sales * random.uniform(0.7, 1.3), 1)
            for _ in range(days_ahead)
        ]
        
        return {
            "product_id": product_id,
            "product_name": f"Product {product_id}",
            "current_stock": current_stock,
            "predicted_daily_sales": predicted_daily_sales,
            "days_until_stockout": round(min(days_ahead, days_until_stockout)),
            "reorder_recommendation": days_until_stockout < 7,
            "model_type": "mock",
            "confidence": round(random.uniform(0.7, 0.9), 2)
        }
    
    @staticmethod
    def financial_forecast(db: Session, business_id: int, days_ahead: int = 30) -> Dict[str, Any]:
        """
        Stub implementation for financial forecast - returns mock data
        """
        # Mock total revenue
        base_daily_revenue = random.uniform(1000, 5000)
        total_predicted_revenue = base_daily_revenue * days_ahead * random.uniform(0.9, 1.1)
        
        # Mock expense categories
        expense_categories = {
            "operating": round(total_predicted_revenue * random.uniform(0.2, 0.3), 2),
            "salaries": round(total_predicted_revenue * random.uniform(0.2, 0.35), 2),
            "inventory": round(total_predicted_revenue * random.uniform(0.15, 0.25), 2),
            "marketing": round(total_predicted_revenue * random.uniform(0.05, 0.1), 2),
            "other": round(total_predicted_revenue * random.uniform(0.03, 0.08), 2)
        }
        
        total_expenses = sum(expense_categories.values())
        predicted_profit = total_predicted_revenue - total_expenses
        
        return {
            "total_predicted_revenue": round(total_predicted_revenue, 2),
            "total_predicted_expenses": round(total_expenses, 2),
            "predicted_profit": round(predicted_profit, 2),
            "profit_margin": round((predicted_profit / total_predicted_revenue) * 100, 1),
            "expense_breakdown": expense_categories,
            "confidence": round(random.uniform(0.6, 0.85), 2)
        } 
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from app.models.product import Product
from app.models.sale import Sale

class SalesPrediction:
    @staticmethod
    def predict_next_month_sales():
        # Simple moving average prediction
        sales_data = pd.DataFrame(Sale.get_monthly_sales())
        if len(sales_data) < 3:
            return None
        
        moving_average = sales_data['amount'].rolling(window=3).mean()
        return moving_average.iloc[-1]

    @staticmethod
    def get_seasonal_trends():
        sales_data = pd.DataFrame(Sale.get_all_sales())
        sales_data['month'] = pd.to_datetime(sales_data['date']).dt.month
        monthly_avg = sales_data.groupby('month')['amount'].mean()
        return monthly_avg.to_dict()

    @staticmethod
    def predict_stock_requirements():
        products = Product.get_all()
        predictions = {}
        for product in products:
            sales_velocity = product.get_sales_velocity()
            predicted_demand = sales_velocity * 1.1  # 10% buffer
            predictions[product.id] = {
                'product_name': product.name,
                'predicted_demand': predicted_demand,
                'recommended_stock': max(predicted_demand * 2, 10)
            }
        return predictions 
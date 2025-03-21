from flask import render_template
from app.analytics import bp
from app.models.sale import Sale
from app.models.product import Product
from flask_login import login_required

@bp.route('/analytics/reports')
@login_required
def reports():
    sales_data = Sale.get_analytics_data()
    return render_template('analytics/reports.html', sales_data=sales_data)

@bp.route('/analytics/predictions')
@login_required
def predictions():
    prediction_data = Sale.get_predictions()
    return render_template('analytics/predictions.html', predictions=prediction_data)

@bp.route('/analytics/insights')
@login_required
def insights():
    insights_data = {
        'top_products': Product.get_top_selling(),
        'revenue_trends': Sale.get_revenue_trends(),
        'stock_alerts': Product.get_low_stock_alerts()
    }
    return render_template('analytics/insights.html', insights=insights_data) 
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.analytics_service import AnalyticsService
from ..utils.decorators import admin_required

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics/dashboard')
@jwt_required()
def get_dashboard_analytics():
    try:
        time_range = request.args.get('timeRange', '30days')
        metrics = AnalyticsService.get_dashboard_metrics(time_range)
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/sales')
@jwt_required()
def get_sales_analytics():
    try:
        start_date = request.args.get('start_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
        end_date = request.args.get('end_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
        group_by = request.args.get('group_by', 'day')

        metrics = AnalyticsService.get_dashboard_metrics()
        return jsonify({
            'sales_data': metrics['sales_metrics']['daily_sales']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/products')
@jwt_required()
def get_product_analytics():
    try:
        metrics = AnalyticsService.get_dashboard_metrics()
        return jsonify({
            'product_metrics': metrics['product_metrics']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/customers')
@jwt_required()
def get_customer_analytics():
    try:
        metrics = AnalyticsService.get_dashboard_metrics()
        return jsonify({
            'customer_metrics': metrics['customer_metrics']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/inventory')
@jwt_required()
def get_inventory_analytics():
    try:
        metrics = AnalyticsService.get_inventory_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/events', methods=['POST'])
@jwt_required()
def track_event():
    try:
        data = request.get_json()
        event_type = data.get('event_type')
        event_data = data.get('event_data')
        user_id = get_jwt_identity()

        if not event_type:
            return jsonify({'error': 'Event type is required'}), 400

        event = AnalyticsService.track_event(
            event_type=event_type,
            event_data=event_data,
            user_id=user_id
        )
        return jsonify(event.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/metrics', methods=['POST'])
@jwt_required()
@admin_required
def record_metric():
    try:
        data = request.get_json()
        metric_type = data.get('metric_type')
        metric_value = data.get('metric_value')
        metric_date = data.get('metric_date')

        if not metric_type or metric_value is None:
            return jsonify({'error': 'Metric type and value are required'}), 400

        metric = AnalyticsService.record_metric(
            metric_type=metric_type,
            metric_value=metric_value,
            metric_date=metric_date
        )
        return jsonify(metric.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/reports', methods=['POST'])
@jwt_required()
@admin_required
def generate_report():
    try:
        data = request.get_json()
        report_type = data.get('report_type')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        created_by = get_jwt_identity()

        if not all([report_type, start_date, end_date]):
            return jsonify({'error': 'Report type, start date, and end date are required'}), 400

        report = AnalyticsService.generate_report(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            created_by=created_by
        )
        return jsonify(report.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/api/analytics/reports/<report_type>')
@jwt_required()
def get_reports(report_type):
    try:
        user_id = get_jwt_identity()
        reports = AnalyticsReport.get_reports_by_type(report_type, user_id)
        return jsonify([report.to_dict() for report in reports])
    except Exception as e:
        return jsonify({'error': str(e)}), 500 
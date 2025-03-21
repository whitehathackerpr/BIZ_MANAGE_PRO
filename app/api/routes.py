from flask import Blueprint, jsonify, request, send_file
from flask_login import login_required, current_user
from app.utils.decorators import admin_required
from app.services.reports import ReportGenerator
from app.services.inventory import InventoryService
from app.services.profile import ProfileService
from datetime import datetime

api_bp = Blueprint('api', __name__)

# Report endpoints
@api_bp.route('/api/reports/sales')
@login_required
@admin_required
def sales_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    format = request.args.get('format', 'excel')
    
    if not start_date or not end_date:
        return jsonify({'error': 'Date range required'}), 400
    
    try:
        report = ReportGenerator.generate_sales_report(
            datetime.strptime(start_date, '%Y-%m-%d'),
            datetime.strptime(end_date, '%Y-%m-%d'),
            format
        )
        
        return send_file(
            report,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            if format == 'excel' else 'application/pdf',
            as_attachment=True,
            attachment_filename=f'sales_report.{format}'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/reports/inventory')
@login_required
@admin_required
def inventory_report():
    category_id = request.args.get('category_id', type=int)
    format = request.args.get('format', 'excel')
    
    try:
        report = ReportGenerator.generate_inventory_report(category_id, format)
        
        return send_file(
            report,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            if format == 'excel' else 'application/pdf',
            as_attachment=True,
            attachment_filename=f'inventory_report.{format}'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Inventory endpoints
@api_bp.route('/api/inventory/adjust', methods=['POST'])
@login_required
@admin_required
def adjust_inventory():
    data = request.get_json()
    
    try:
        transaction = InventoryService.adjust_stock(
            product_id=data['product_id'],
            quantity=data['quantity'],
            type=data['type'],
            reference_id=data.get('reference_id'),
            notes=data.get('notes'),
            user_id=current_user.id
        )
        
        return jsonify({
            'message': 'Inventory adjusted successfully',
            'transaction_id': transaction.id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api_bp.route('/api/inventory/movements/<int:product_id>')
@login_required
def inventory_movements(product_id):
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    movements = InventoryService.get_stock_movements(
        product_id,
        start_date=datetime.strptime(start_date, '%Y-%m-%d') if start_date else None,
        end_date=datetime.strptime(end_date, '%Y-%m-%d') if end_date else None
    )
    
    return jsonify([{
        'id': m.id,
        'type': m.type,
        'quantity': m.quantity,
        'reference_id': m.reference_id,
        'notes': m.notes,
        'created_at': m.created_at.isoformat()
    } for m in movements])

# Profile endpoints
@api_bp.route('/api/profile', methods=['GET', 'PUT'])
@login_required
def profile():
    if request.method == 'GET':
        profile = ProfileService.get_profile(current_user.id)
        return jsonify(profile.to_dict())
    else:
        data = request.get_json()
        profile = ProfileService.update_profile(current_user.id, data)
        return jsonify(profile.to_dict())

@api_bp.route('/api/profile/addresses', methods=['GET', 'POST'])
@login_required
def addresses():
    if request.method == 'GET':
        addresses = ProfileService.get_addresses(
            current_user.id,
            type=request.args.get('type')
        )
        return jsonify([addr.to_dict() for addr in addresses])
    else:
        data = request.get_json()
        address = ProfileService.add_address(current_user.id, data)
        return jsonify(address.to_dict()), 201

@api_bp.route('/api/profile/addresses/<int:id>', methods=['PUT', 'DELETE'])
@login_required
def address(id):
    if request.method == 'PUT':
        data = request.get_json()
        address = ProfileService.update_address(id, data)
        return jsonify(address.to_dict())
    else:
        ProfileService.delete_address(id)
        return '', 204 
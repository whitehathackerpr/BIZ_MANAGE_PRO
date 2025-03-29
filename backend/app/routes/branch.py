from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.branch import Branch
from app.models.inventory import BranchInventory
from app.models.user import User
from app.models.sale import Sale
from app.services.analytics_service import AnalyticsService
from app import db
from datetime import datetime, timedelta

branch_bp = Blueprint('branch', __name__)

@branch_bp.route('/api/branches', methods=['GET'])
@jwt_required()
def get_branches():
    try:
        branches = Branch.query.all()
        return jsonify([branch.to_dict() for branch in branches])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches', methods=['POST'])
@jwt_required()
def create_branch():
    try:
        data = request.get_json()
        branch = Branch(**data)
        db.session.add(branch)
        db.session.commit()
        return jsonify(branch.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>', methods=['GET'])
@jwt_required()
def get_branch(branch_id):
    try:
        branch = Branch.query.get_or_404(branch_id)
        return jsonify(branch.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>', methods=['PUT'])
@jwt_required()
def update_branch(branch_id):
    try:
        branch = Branch.query.get_or_404(branch_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(branch, key, value)
        db.session.commit()
        return jsonify(branch.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>', methods=['DELETE'])
@jwt_required()
def delete_branch(branch_id):
    try:
        branch = Branch.query.get_or_404(branch_id)
        db.session.delete(branch)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Branch Inventory Endpoints
@branch_bp.route('/api/branches/<int:branch_id>/inventory', methods=['GET'])
@jwt_required()
def get_branch_inventory(branch_id):
    try:
        inventory = BranchInventory.query.filter_by(branch_id=branch_id).all()
        return jsonify([item.to_dict() for item in inventory])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>/inventory', methods=['POST'])
@jwt_required()
def add_branch_inventory(branch_id):
    try:
        data = request.get_json()
        data['branch_id'] = branch_id
        inventory_item = BranchInventory(**data)
        db.session.add(inventory_item)
        db.session.commit()
        return jsonify(inventory_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>/inventory/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_branch_inventory(branch_id, item_id):
    try:
        item = BranchInventory.query.filter_by(branch_id=branch_id, id=item_id).first_or_404()
        data = request.get_json()
        for key, value in data.items():
            setattr(item, key, value)
        db.session.commit()
        return jsonify(item.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>/inventory/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_branch_inventory(branch_id, item_id):
    try:
        item = BranchInventory.query.filter_by(branch_id=branch_id, id=item_id).first_or_404()
        db.session.delete(item)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Branch Transfer Endpoints
@branch_bp.route('/api/branches/<int:branch_id>/inventory/<int:item_id>/transfer', methods=['POST'])
@jwt_required()
def transfer_inventory(branch_id, item_id):
    try:
        data = request.get_json()
        source_item = BranchInventory.query.filter_by(branch_id=branch_id, id=item_id).first_or_404()
        target_branch_id = data.get('target_branch_id')
        quantity = data.get('quantity')

        if source_item.quantity < quantity:
            return jsonify({'error': 'Insufficient inventory'}), 400

        # Create or update target branch inventory
        target_item = BranchInventory.query.filter_by(
            branch_id=target_branch_id,
            product_id=source_item.product_id
        ).first()

        if target_item:
            target_item.quantity += quantity
        else:
            target_item = BranchInventory(
                branch_id=target_branch_id,
                product_id=source_item.product_id,
                quantity=quantity,
                min_stock_level=source_item.min_stock_level,
                max_stock_level=source_item.max_stock_level
            )
            db.session.add(target_item)

        source_item.quantity -= quantity
        db.session.commit()
        return jsonify({'message': 'Transfer successful'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Branch Performance Endpoints
@branch_bp.route('/api/branches/<int:branch_id>/performance', methods=['GET'])
@jwt_required()
def get_branch_performance(branch_id):
    try:
        time_range = request.args.get('timeRange', 'week')
        end_date = datetime.now()
        
        if time_range == 'day':
            start_date = end_date - timedelta(days=1)
        elif time_range == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif time_range == 'month':
            start_date = end_date - timedelta(days=30)
        else:  # year
            start_date = end_date - timedelta(days=365)

        # Get sales data
        sales = Sale.query.filter(
            Sale.branch_id == branch_id,
            Sale.created_at.between(start_date, end_date)
        ).all()

        # Calculate metrics
        revenue = sum(sale.total_amount for sale in sales)
        orders = len(sales)
        average_order_value = revenue / orders if orders > 0 else 0

        # Get inventory data
        inventory = BranchInventory.query.filter_by(branch_id=branch_id).all()
        inventory_data = [{
            'name': item.product.name,
            'quantity': item.quantity
        } for item in inventory]

        # Get top products
        top_products = AnalyticsService.get_top_products(branch_id, start_date, end_date)

        # Calculate customer retention
        customer_retention = AnalyticsService.calculate_customer_retention(branch_id, start_date, end_date)

        return jsonify({
            'revenue': revenue,
            'orders': orders,
            'averageOrderValue': average_order_value,
            'inventory': inventory_data,
            'topProducts': top_products,
            'customerRetention': customer_retention,
            'sales': [{
                'date': sale.created_at.strftime('%Y-%m-%d'),
                'amount': sale.total_amount
            } for sale in sales]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Branch Settings Endpoints
@branch_bp.route('/api/branches/<int:branch_id>/settings', methods=['GET'])
@jwt_required()
def get_branch_settings(branch_id):
    try:
        branch = Branch.query.get_or_404(branch_id)
        return jsonify(branch.settings)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>/settings', methods=['PUT'])
@jwt_required()
def update_branch_settings(branch_id):
    try:
        branch = Branch.query.get_or_404(branch_id)
        data = request.get_json()
        branch.settings = data
        db.session.commit()
        return jsonify(branch.settings)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Branch Users Endpoints
@branch_bp.route('/api/branches/<int:branch_id>/users', methods=['GET'])
@jwt_required()
def get_branch_users(branch_id):
    try:
        users = User.query.filter_by(branch_id=branch_id).all()
        return jsonify([user.to_dict() for user in users])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>/users', methods=['POST'])
@jwt_required()
def assign_user_to_branch(branch_id):
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user = User.query.get_or_404(user_id)
        user.branch_id = branch_id
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_branch_user(branch_id, user_id):
    try:
        user = User.query.filter_by(branch_id=branch_id, id=user_id).first_or_404()
        data = request.get_json()
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@branch_bp.route('/api/branches/<int:branch_id>/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_user_from_branch(branch_id, user_id):
    try:
        user = User.query.filter_by(branch_id=branch_id, id=user_id).first_or_404()
        user.branch_id = None
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 
from flask_restx import Namespace, Resource, fields
from flask import request, g
from ..models.product import Product
from ..models.inventory import InventoryTransaction
from ..utils.auth import require_auth
from ..utils.pagination import paginate

api = Namespace('inventory', description='Inventory operations')

# Models
inventory_transaction_model = api.model('InventoryTransaction', {
    'id': fields.Integer(readonly=True),
    'product_id': fields.Integer(required=True),
    'type': fields.String(required=True, enum=['in', 'out', 'adjustment']),
    'quantity': fields.Integer(required=True),
    'notes': fields.String,
    'created_at': fields.DateTime(readonly=True)
})

stock_level_model = api.model('StockLevel', {
    'product_id': fields.Integer,
    'name': fields.String,
    'current_stock': fields.Integer,
    'reorder_point': fields.Integer,
    'status': fields.String
})

@api.route('/transactions')
class InventoryTransactionList(Resource):
    @api.doc('create_inventory_transaction', security='apikey')
    @api.expect(inventory_transaction_model)
    @api.marshal_with(inventory_transaction_model)
    @require_auth
    def post(self):
        """Create a new inventory transaction"""
        data = request.get_json()
        product = Product.query.get_or_404(data['product_id'])

        # Create transaction
        transaction = InventoryTransaction(
            product_id=product.id,
            type=data['type'],
            quantity=data['quantity'],
            notes=data.get('notes'),
            user_id=g.user.id
        )

        # Update product stock
        if data['type'] == 'in':
            product.stock += data['quantity']
        elif data['type'] == 'out':
            if product.stock < data['quantity']:
                return {'message': 'Insufficient stock'}, 400
            product.stock -= data['quantity']
        else:  # adjustment
            product.stock = data['quantity']

        transaction.save()
        product.save()
        return transaction, 201

@api.route('/stock-levels')
class StockLevels(Resource):
    @api.doc('get_stock_levels', security='apikey')
    @api.marshal_list_with(stock_level_model)
    @require_auth
    def get(self):
        """Get current stock levels"""
        query = Product.query

        # Filter by status
        status = request.args.get('status')
        if status == 'low':
            query = query.filter(Product.stock <= Product.reorder_point)
        elif status == 'out':
            query = query.filter(Product.stock == 0)

        products = query.all()
        return [{
            'product_id': p.id,
            'name': p.name,
            'current_stock': p.stock,
            'reorder_point': p.reorder_point,
            'status': 'out' if p.stock == 0 else 'low' if p.stock <= p.reorder_point else 'ok'
        } for p in products] 
from flask_restx import Namespace, Resource, fields
from flask import request, g
from ..models.sale import Sale, SaleItem
from ..models.product import Product
from ..utils.auth import require_auth
from ..utils.pagination import paginate
from datetime import datetime

api = Namespace('sales', description='Sales operations')

# Models
sale_item_model = api.model('SaleItem', {
    'product_id': fields.Integer(required=True),
    'quantity': fields.Integer(required=True),
    'price': fields.Float(readonly=True),
    'total': fields.Float(readonly=True)
})

sale_model = api.model('Sale', {
    'id': fields.Integer(readonly=True),
    'items': fields.List(fields.Nested(sale_item_model), required=True),
    'total': fields.Float(readonly=True),
    'payment_method': fields.String(required=True),
    'status': fields.String(readonly=True),
    'created_at': fields.DateTime(readonly=True)
})

@api.route('/')
class SaleList(Resource):
    @api.doc('create_sale', security='apikey')
    @api.expect(sale_model)
    @api.marshal_with(sale_model)
    @require_auth
    def post(self):
        """Create a new sale"""
        data = request.get_json()
        
        # Create sale
        sale = Sale(
            user_id=g.user.id,
            payment_method=data['payment_method'],
            status='completed'
        )

        total = 0
        # Process items
        for item_data in data['items']:
            product = Product.query.get_or_404(item_data['product_id'])
            
            # Check stock
            if product.stock < item_data['quantity']:
                return {'message': f'Insufficient stock for product {product.name}'}, 400

            # Create sale item
            item = SaleItem(
                product_id=product.id,
                quantity=item_data['quantity'],
                price=product.price,
                total=product.price * item_data['quantity']
            )
            sale.items.append(item)
            total += item.total

            # Update stock
            product.stock -= item_data['quantity']
            product.save()

        sale.total = total
        sale.save()
        return sale, 201

@api.route('/<int:id>')
class SaleResource(Resource):
    @api.doc('get_sale', security='apikey')
    @api.marshal_with(sale_model)
    @require_auth
    def get(self, id):
        """Get a sale by ID"""
        sale = Sale.query.get_or_404(id)
        return sale

@api.route('/history')
class SaleHistory(Resource):
    @api.doc('get_sales_history', security='apikey')
    @api.marshal_list_with(sale_model)
    @require_auth
    def get(self):
        """Get sales history"""
        query = Sale.query

        # Filter by date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        if end_date:
            query = query.filter(Sale.created_at <= end_date)

        # Filter by payment method
        payment_method = request.args.get('payment_method')
        if payment_method:
            query = query.filter(Sale.payment_method == payment_method)

        return paginate(query.order_by(Sale.created_at.desc())) 
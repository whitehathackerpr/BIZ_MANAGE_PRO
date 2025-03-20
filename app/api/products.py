from flask_restx import Namespace, Resource, fields
from flask import request
from ..models.product import Product
from ..utils.auth import require_auth
from ..utils.pagination import paginate

api = Namespace('products', description='Product operations')

# Models
product_model = api.model('Product', {
    'id': fields.Integer(readonly=True),
    'name': fields.String(required=True),
    'description': fields.String(),
    'price': fields.Float(required=True),
    'stock': fields.Integer(required=True),
    'category_id': fields.Integer(),
    'sku': fields.String(),
    'barcode': fields.String(),
    'reorder_point': fields.Integer()
})

@api.route('/')
class ProductList(Resource):
    @api.doc('list_products', security='apikey')
    @api.marshal_list_with(product_model)
    @require_auth
    def get(self):
        """List all products"""
        return paginate(Product.query)

    @api.doc('create_product', security='apikey')
    @api.expect(product_model)
    @api.marshal_with(product_model)
    @require_auth
    def post(self):
        """Create a new product"""
        data = request.get_json()
        product = Product(**data)
        product.save()
        return product, 201

@api.route('/<int:id>')
class ProductResource(Resource):
    @api.doc('get_product', security='apikey')
    @api.marshal_with(product_model)
    @require_auth
    def get(self, id):
        """Get a product by ID"""
        product = Product.query.get_or_404(id)
        return product

    @api.doc('update_product', security='apikey')
    @api.expect(product_model)
    @api.marshal_with(product_model)
    @require_auth
    def put(self, id):
        """Update a product"""
        product = Product.query.get_or_404(id)
        data = request.get_json()
        for key, value in data.items():
            setattr(product, key, value)
        product.save()
        return product

    @api.doc('delete_product', security='apikey')
    @require_auth
    def delete(self, id):
        """Delete a product"""
        product = Product.query.get_or_404(id)
        product.delete()
        return {'message': 'Product deleted'}, 200

@api.route('/barcode/<string:barcode>')
class ProductBarcode(Resource):
    @api.doc('get_product_by_barcode', security='apikey')
    @api.marshal_with(product_model)
    @require_auth
    def get(self, barcode):
        """Get a product by barcode"""
        product = Product.query.filter_by(barcode=barcode).first_or_404()
        return product 
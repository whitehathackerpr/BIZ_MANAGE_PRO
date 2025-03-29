from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from ..models import Product, Category, ProductImage, ProductVariant
from ..extensions import db
from ..utils.decorators import admin_required
from ..utils.images import save_image, delete_image
from ..utils.validation import validate_product_data

products_bp = Blueprint('products', __name__)

@products_bp.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', '')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    in_stock = request.args.get('in_stock', type=bool)
    
    query = Product.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock:
        query = query.filter(Product.stock > 0)
    
    products = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': products.page
    })

@products_bp.route('/api/products', methods=['POST'])
@jwt_required()
@admin_required
def create_product():
    data = request.get_json()
    
    # Validate product data
    errors = validate_product_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Check for duplicate SKU
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({
            'error': 'SKU already exists'
        }), 400
    
    product = Product(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        stock=data.get('stock', 0),
        category_id=data.get('category_id'),
        sku=data['sku'],
        barcode=data.get('barcode'),
        weight=data.get('weight'),
        dimensions=data.get('dimensions'),
        min_stock_level=data.get('min_stock_level', 10),
        supplier_id=data.get('supplier_id')
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({
        'message': 'Product created successfully',
        'product': product.to_dict()
    }), 201

@products_bp.route('/api/products/<int:id>', methods=['GET'])
@jwt_required()
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify(product.to_dict())

@products_bp.route('/api/products/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    
    # Validate product data
    errors = validate_product_data(data, partial=True)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Check for duplicate SKU if SKU is being updated
    if 'sku' in data and data['sku'] != product.sku:
        if Product.query.filter_by(sku=data['sku']).first():
            return jsonify({
                'error': 'SKU already exists'
            }), 400
        product.sku = data['sku']
    
    # Update other fields
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'stock' in data:
        product.stock = data['stock']
    if 'category_id' in data:
        product.category_id = data['category_id']
    if 'barcode' in data:
        product.barcode = data['barcode']
    if 'weight' in data:
        product.weight = data['weight']
    if 'dimensions' in data:
        product.dimensions = data['dimensions']
    if 'min_stock_level' in data:
        product.min_stock_level = data['min_stock_level']
    if 'supplier_id' in data:
        product.supplier_id = data['supplier_id']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict()
    })

@products_bp.route('/api/products/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_product(id):
    product = Product.query.get_or_404(id)
    
    # Delete associated images
    for image in product.images:
        delete_image(image.filename)
        db.session.delete(image)
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({
        'message': 'Product deleted successfully'
    })

@products_bp.route('/api/products/<int:id>/images', methods=['POST'])
@jwt_required()
@admin_required
def add_product_image(id):
    product = Product.query.get_or_404(id)
    
    if 'image' not in request.files:
        return jsonify({
            'error': 'No image file provided'
        }), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({
            'error': 'No selected file'
        }), 400
    
    filename = save_image(file)
    image = ProductImage(
        product=product,
        filename=filename,
        url=f"{current_app.config['UPLOAD_URL']}/{filename}",
        is_primary=not product.images.first()
    )
    
    db.session.add(image)
    db.session.commit()
    
    return jsonify({
        'message': 'Image added successfully',
        'image': image.to_dict()
    })

@products_bp.route('/api/products/<int:id>/images/<int:image_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_product_image(id, image_id):
    product = Product.query.get_or_404(id)
    image = ProductImage.query.get_or_404(image_id)
    
    if image.product_id != product.id:
        return jsonify({
            'error': 'Image does not belong to this product'
        }), 400
    
    delete_image(image.filename)
    db.session.delete(image)
    db.session.commit()
    
    return jsonify({
        'message': 'Image deleted successfully'
    })

@products_bp.route('/api/products/<int:id>/variants', methods=['POST'])
@jwt_required()
@admin_required
def add_product_variant(id):
    product = Product.query.get_or_404(id)
    data = request.get_json()
    
    # Check for duplicate SKU
    if ProductVariant.query.filter_by(sku=data['sku']).first():
        return jsonify({
            'error': 'SKU already exists'
        }), 400
    
    variant = ProductVariant(
        product=product,
        name=data['name'],
        sku=data['sku'],
        price_adjustment=data.get('price_adjustment', 0),
        stock=data.get('stock', 0),
        attributes=data.get('attributes')
    )
    
    db.session.add(variant)
    db.session.commit()
    
    return jsonify({
        'message': 'Variant added successfully',
        'variant': variant.to_dict()
    })

@products_bp.route('/api/products/<int:id>/variants/<int:variant_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_product_variant(id, variant_id):
    product = Product.query.get_or_404(id)
    variant = ProductVariant.query.get_or_404(variant_id)
    
    if variant.product_id != product.id:
        return jsonify({
            'error': 'Variant does not belong to this product'
        }), 400
    
    data = request.get_json()
    
    # Check for duplicate SKU if SKU is being updated
    if 'sku' in data and data['sku'] != variant.sku:
        if ProductVariant.query.filter_by(sku=data['sku']).first():
            return jsonify({
                'error': 'SKU already exists'
            }), 400
        variant.sku = data['sku']
    
    # Update other fields
    if 'name' in data:
        variant.name = data['name']
    if 'price_adjustment' in data:
        variant.price_adjustment = data['price_adjustment']
    if 'stock' in data:
        variant.stock = data['stock']
    if 'attributes' in data:
        variant.attributes = data['attributes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Variant updated successfully',
        'variant': variant.to_dict()
    })

@products_bp.route('/api/products/<int:id>/variants/<int:variant_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_product_variant(id, variant_id):
    product = Product.query.get_or_404(id)
    variant = ProductVariant.query.get_or_404(variant_id)
    
    if variant.product_id != product.id:
        return jsonify({
            'error': 'Variant does not belong to this product'
        }), 400
    
    db.session.delete(variant)
    db.session.commit()
    
    return jsonify({
        'message': 'Variant deleted successfully'
    }) 
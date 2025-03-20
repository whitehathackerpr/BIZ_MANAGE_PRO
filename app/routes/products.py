from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.product import Product, Category, ProductImage, ProductVariant
from app.forms.product import ProductForm, CategoryForm
from app.utils.images import save_image, delete_image
from app.utils.decorators import admin_required

products_bp = Blueprint('products', __name__)

@products_bp.route('/products')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category', type=int)
    search = request.args.get('search', '')
    
    query = Product.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(
            db.or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%')
            )
        )
    
    products = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    categories = Category.query.all()
    
    return render_template(
        'products/index.html',
        products=products,
        categories=categories,
        search=search
    )

@products_bp.route('/products/create', methods=['GET', 'POST'])
@login_required
@admin_required
def create():
    form = ProductForm()
    form.category_id.choices = [
        (c.id, c.name) for c in Category.query.order_by('name')
    ]
    
    if form.validate_on_submit():
        product = Product(
            name=form.name.data,
            slug=form.slug.data,
            sku=form.sku.data,
            description=form.description.data,
            price=form.price.data,
            cost=form.cost.data,
            stock=form.stock.data,
            reorder_point=form.reorder_point.data,
            category_id=form.category_id.data,
            status=form.status.data
        )
        db.session.add(product)
        
        # Handle images
        if form.images.data:
            for image_data in form.images.data:
                filename = save_image(image_data)
                image = ProductImage(
                    product=product,
                    filename=filename,
                    url=url_for('static', filename=f'uploads/{filename}'),
                    is_primary=not product.images.first()
                )
                db.session.add(image)
        
        # Handle variants
        if form.variants.data:
            for variant_data in form.variants.data:
                variant = ProductVariant(
                    product=product,
                    name=variant_data['name'],
                    sku=variant_data['sku'],
                    price_adjustment=variant_data['price_adjustment'],
                    stock=variant_data['stock']
                )
                db.session.add(variant)
        
        db.session.commit()
        flash('Product created successfully', 'success')
        return redirect(url_for('products.index'))
    
    return render_template('products/create.html', form=form)

@products_bp.route('/products/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit(id):
    product = Product.query.get_or_404(id)
    form = ProductForm(obj=product)
    form.category_id.choices = [
        (c.id, c.name) for c in Category.query.order_by('name')
    ]
    
    if form.validate_on_submit():
        product.name = form.name.data
        product.slug = form.slug.data
        product.sku = form.sku.data
        product.description = form.description.data
        product.price = form.price.data
        product.cost = form.cost.data
        product.stock = form.stock.data
        product.reorder_point = form.reorder_point.data
        product.category_id = form.category_id.data
        product.status = form.status.data
        
        # Handle images
        if form.images.data:
            for image_data in form.images.data:
                filename = save_image(image_data)
                image = ProductImage(
                    product=product,
                    filename=filename,
                    url=url_for('static', filename=f'uploads/{filename}'),
                    is_primary=not product.images.first()
                )
                db.session.add(image)
        
        # Handle variants
        if form.variants.data:
            # Clear existing variants
            ProductVariant.query.filter_by(product_id=product.id).delete()
            
            for variant_data in form.variants.data:
                variant = ProductVariant(
                    product=product,
                    name=variant_data['name'],
                    sku=variant_data['sku'],
                    price_adjustment=variant_data['price_adjustment'],
                    stock=variant_data['stock']
                )
                db.session.add(variant)
        
        db.session.commit()
        flash('Product updated successfully', 'success')
        return redirect(url_for('products.index'))
    
    return render_template('products/edit.html', form=form, product=product)

@products_bp.route('/products/<int:id>/delete', methods=['POST'])
@login_required
@admin_required
def delete(id):
    product = Product.query.get_or_404(id)
    
    # Delete associated images
    for image in product.images:
        delete_image(image.filename)
        db.session.delete(image)
    
    db.session.delete(product)
    db.session.commit()
    
    flash('Product deleted successfully', 'success')
    return redirect(url_for('products.index'))

@products_bp.route('/api/products/search')
@login_required
def search():
    query = request.args.get('q', '')
    products = Product.query.filter(
        db.or_(
            Product.name.ilike(f'%{query}%'),
            Product.sku.ilike(f'%{query}%')
        )
    ).limit(10).all()
    
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'sku': p.sku,
        'price': float(p.price),
        'stock': p.stock
    } for p in products]) 
from flask import render_template, request, redirect, url_for, flash
from app.inventory import bp
from app.models.product import Product
from app.models.supplier import Supplier
from flask_login import login_required

@bp.route('/inventory')
@login_required
def index():
    products = Product.get_all()
    return render_template('inventory/products.html', products=products)

@bp.route('/inventory/add', methods=['GET', 'POST'])
@login_required
def add_product():
    if request.method == 'POST':
        product_data = {
            'name': request.form.get('name'),
            'price': float(request.form.get('price')),
            'stock': int(request.form.get('stock')),
            'barcode': request.form.get('barcode'),
            'supplier_id': int(request.form.get('supplier_id'))
        }
        Product.create(**product_data)
        flash('Product added successfully!', 'success')
        return redirect(url_for('inventory.index'))
    
    suppliers = Supplier.get_all()
    return render_template('inventory/add_product.html', suppliers=suppliers)

@bp.route('/inventory/stock-level')
@login_required
def stock_level():
    low_stock = Product.get_low_stock()
    return render_template('inventory/stock_level.html', low_stock=low_stock) 
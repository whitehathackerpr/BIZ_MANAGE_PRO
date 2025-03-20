from flask import render_template, request, jsonify, redirect, url_for
from app.sales import bp
from app.models.sale import Sale
from app.models.product import Product
from flask_login import login_required, current_user
from app.sales.invoice_generator import InvoiceGenerator

@bp.route('/sales/new', methods=['GET', 'POST'])
@login_required
def new_sale():
    if request.method == 'POST':
        data = request.get_json()
        items = data.get('items', [])
        total = data.get('total')
        
        sale = Sale.create(
            user_id=current_user.id,
            items=items,
            total=total
        )
        
        # Generate invoice
        invoice_generator = InvoiceGenerator(sale)
        invoice_path = invoice_generator.generate()
        
        return jsonify({
            'success': True,
            'sale_id': sale.id,
            'invoice_url': invoice_path
        })
    
    products = Product.get_all()
    return render_template('sales/new_sale.html', products=products)

@bp.route('/sales/history')
@login_required
def sales_history():
    sales = Sale.get_all_by_user(current_user.id)
    return render_template('sales/sales_history.html', sales=sales)

@bp.route('/sales/invoice/<int:sale_id>')
@login_required
def view_invoice(sale_id):
    sale = Sale.get_by_id(sale_id)
    return render_template('sales/invoice.html', sale=sale) 
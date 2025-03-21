class SalesManager {
    constructor() {
        this.items = new Map();
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.barcodeInput = document.getElementById('barcodeInput');
        this.saleItems = document.getElementById('saleItems');
        this.subtotalElement = document.getElementById('subtotal');
        this.taxElement = document.getElementById('tax');
        this.totalElement = document.getElementById('total');
        this.completeSaleBtn = document.getElementById('completeSale');
        this.cancelSaleBtn = document.getElementById('cancelSale');
    }

    bindEvents() {
        this.barcodeInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleBarcodeInput(e.target.value);
            }
        });

        this.completeSaleBtn?.addEventListener('click', () => this.completeSale());
        this.cancelSaleBtn?.addEventListener('click', () => this.cancelSale());
    }

    async handleBarcodeInput(barcode) {
        try {
            const response = await apiRequest('/api/products/barcode', {
                method: 'POST',
                body: JSON.stringify({ barcode })
            });

            if (response.product) {
                this.addItem(response.product);
            }
        } catch (error) {
            this.showError('Error scanning product');
        }
        this.barcodeInput.value = '';
    }

    addItem(product) {
        if (this.items.has(product.id)) {
            const item = this.items.get(product.id);
            item.quantity++;
            item.total = item.quantity * item.price;
            this.updateItemRow(product.id);
        } else {
            const item = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price
            };
            this.items.set(product.id, item);
            this.addItemRow(item);
        }
        this.updateTotals();
    }

    updateItemRow(productId) {
        const item = this.items.get(productId);
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            row.querySelector('.item-quantity').textContent = item.quantity;
            row.querySelector('.item-total').textContent = formatCurrency(item.total);
        }
    }

    addItemRow(item) {
        const tbody = this.saleItems.querySelector('tbody');
        const row = document.createElement('tr');
        row.dataset.productId = item.id;
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatCurrency(item.price)}</td>
            <td class="item-quantity">${item.quantity}</td>
            <td class="item-total">${formatCurrency(item.total)}</td>
            <td>
                <button class="btn btn-sm btn-danger remove-item">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        row.querySelector('.remove-item').addEventListener('click', () => {
            this.removeItem(item.id);
        });

        tbody.appendChild(row);
    }

    removeItem(productId) {
        this.items.delete(productId);
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        row?.remove();
        this.updateTotals();
    }

    updateTotals() {
        const subtotal = Array.from(this.items.values())
            .reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        this.subtotalElement.textContent = formatCurrency(subtotal);
        this.taxElement.textContent = formatCurrency(tax);
        this.totalElement.textContent = formatCurrency(total);
    }

    async completeSale() {
        if (this.items.size === 0) {
            this.showError('No items in sale');
            return;
        }

        try {
            const saleData = {
                items: Array.from(this.items.values()),
                payment_method: document.getElementById('paymentMethod').value,
                total: parseFloat(this.totalElement.textContent.replace('$', ''))
            };

            const response = await apiRequest('/api/sales/create', {
                method: 'POST',
                body: JSON.stringify(saleData)
            });

            if (response.success) {
                this.showSuccess('Sale completed successfully');
                window.location.href = `/sales/invoice/${response.sale_id}`;
            }
        } catch (error) {
            this.showError('Error completing sale');
        }
    }

    cancelSale() {
        if (confirm('Are you sure you want to cancel this sale?')) {
            this.items.clear();
            this.saleItems.querySelector('tbody').innerHTML = '';
            this.updateTotals();
        }
    }

    showSuccess(message) {
        // Implementation similar to inventory.js
    }

    showError(message) {
        // Implementation similar to inventory.js
    }
}

// Initialize sales manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SalesManager();
}); 
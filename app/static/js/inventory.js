class InventoryManager {
    constructor() {
        this.products = new Map();
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalPages = 1;
        this.currentFilters = {
            category: '',
            search: '',
            stock_status: 'all'
        };
    }

    init() {
        // Initialize components
        this.initializeDataTable();
        this.initializeFilters();
        
        // Load initial data
        this.loadProducts();
        
        // Add event listeners
        this.addEventListeners();
    }

    initializeDataTable() {
        this.dataTable = new DataTable('#productsTable', {
            columns: [
                { data: 'sku' },
                { data: 'name' },
                { data: 'category' },
                { data: 'stock' },
                { data: 'reorder_point' },
                { data: 'price' },
                { data: 'actions' }
            ],
            pageLength: this.itemsPerPage,
            order: [[1, 'asc']],
            dom: 'Bfrtip',
            buttons: [
                'excel',
                'pdf',
                {
                    text: 'Add Product',
                    action: () => this.showProductModal()
                }
            ]
        });
    }

    async loadProducts() {
        try {
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                per_page: this.itemsPerPage,
                ...this.currentFilters
            });

            const response = await fetch(`/api/inventory/products?${queryParams}`);
            const data = await response.json();

            this.products.clear();
            data.products.forEach(product => this.products.set(product.id, product));

            this.renderProducts(data.products);
            this.updatePagination(data.total_pages);
        } catch (error) {
            showError('Failed to load products: ' + error.message);
        }
    }

    renderProducts(products) {
        this.dataTable.clear();
        this.dataTable.rows.add(products.map(product => ({
            ...product,
            stock: this.renderStockColumn(product),
            actions: this.renderActionButtons(product)
        })));
        this.dataTable.draw();
    }

    renderStockColumn(product) {
        const stockClass = product.stock <= product.reorder_point ? 'text-danger' : 
                          product.stock <= product.reorder_point * 1.5 ? 'text-warning' : 
                          'text-success';
        
        return `
            <span class="${stockClass}">${product.stock}</span>
            <button class="btn btn-sm btn-outline-primary ms-2 adjust-stock-btn"
                    data-product-id="${product.id}">
                Adjust
            </button>
        `;
    }

    renderActionButtons(product) {
        return `
            <button class="btn btn-sm btn-outline-secondary edit-product-btn"
                    data-product-id="${product.id}">
                Edit
            </button>
            <button class="btn btn-sm btn-outline-info view-history-btn"
                    data-product-id="${product.id}">
                History
            </button>
        `;
    }

    async adjustStock(productId, quantity, type, notes) {
        try {
            const response = await fetch('/api/inventory/adjust', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                    type: type,
                    notes: notes
                })
            });

            if (!response.ok) throw new Error('Failed to adjust stock');

            await this.loadProducts();
            showSuccess('Stock adjusted successfully');
        } catch (error) {
            showError('Failed to adjust stock: ' + error.message);
        }
    }

    async showStockHistory(productId) {
        try {
            const response = await fetch(`/api/inventory/movements/${productId}`);
            const movements = await response.json();

            const product = this.products.get(productId);
            
            const modal = document.getElementById('historyModal');
            const tbody = modal.querySelector('tbody');
            
            tbody.innerHTML = movements.map(m => `
                <tr>
                    <td>${moment(m.created_at).format('YYYY-MM-DD HH:mm')}</td>
                    <td>${m.type}</td>
                    <td class="${m.quantity >= 0 ? 'text-success' : 'text-danger'}">
                        ${m.quantity}
                    </td>
                    <td>${m.reference_id || '-'}</td>
                    <td>${m.notes || '-'}</td>
                </tr>
            `).join('');

            modal.querySelector('.modal-title').textContent = 
                `Stock History - ${product.name} (${product.sku})`;
            
            $(modal).modal('show');
        } catch (error) {
            showError('Failed to load stock history: ' + error.message);
        }
    }

    addEventListeners() {
        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.currentPage = 1;
            this.loadProducts();
        });

        document.getElementById('stockStatusFilter').addEventListener('change', (e) => {
            this.currentFilters.stock_status = e.target.value;
            this.currentPage = 1;
            this.loadProducts();
        });

        document.getElementById('searchInput').addEventListener('input', debounce((e) => {
            this.currentFilters.search = e.target.value;
            this.currentPage = 1;
            this.loadProducts();
        }, 300));

        // Stock adjustment
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('adjust-stock-btn')) {
                const productId = e.target.dataset.productId;
                this.showAdjustStockModal(productId);
            } else if (e.target.classList.contains('view-history-btn')) {
                const productId = e.target.dataset.productId;
                this.showStockHistory(productId);
            }
        });

        // Stock adjustment form submission
        document.getElementById('adjustStockForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.adjustStock(
                formData.get('product_id'),
                parseInt(formData.get('quantity')),
                formData.get('type'),
                formData.get('notes')
            );
            $('#adjustStockModal').modal('hide');
        });

        // Pagination
        document.getElementById('pagination').addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadProducts();
                }
            }
        });
    }

    showAdjustStockModal(productId) {
        const product = this.products.get(parseInt(productId));
        if (!product) return;

        const modal = document.getElementById('adjustStockModal');
        modal.querySelector('.modal-title').textContent = 
            `Adjust Stock - ${product.name} (${product.sku})`;
        
        modal.querySelector('#currentStock').textContent = product.stock;
        modal.querySelector('#productId').value = product.id;
        
        $(modal).modal('show');
    }

    updatePagination(totalPages) {
        this.totalPages = totalPages;
        const pagination = document.getElementById('pagination');
        
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        pagination.innerHTML = html;
    }
}

// Initialize inventory manager
const inventoryManager = new InventoryManager();
document.addEventListener('DOMContentLoaded', () => {
    inventoryManager.init();
}); 
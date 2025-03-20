class OrderProcessor {
    constructor() {
        this.items = new Map();
        this.shippingAddress = null;
        this.billingAddress = null;
        this.shippingMethod = null;
        this.paymentMethod = null;
        this.stripe = null;
        this.elements = null;
    }

    init() {
        // Initialize Stripe
        this.stripe = Stripe(STRIPE_PUBLIC_KEY);
        this.elements = this.stripe.elements();
        
        // Create card element
        const card = this.elements.create('card');
        card.mount('#card-element');
        
        // Add event listeners
        this.addEventListeners();
        
        // Initialize address selectors
        this.initializeAddressSelectors();
    }

    addEventListeners() {
        // Product search and add
        document.getElementById('productSearch').addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });
        
        // Quantity changes
        document.getElementById('orderItems').addEventListener('change', (e) => {
            if (e.target.classList.contains('item-quantity')) {
                const itemId = e.target.closest('.order-item').dataset.itemId;
                this.updateItemQuantity(itemId, parseInt(e.target.value));
            }
        });
        
        // Remove items
        document.getElementById('orderItems').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const itemId = e.target.closest('.order-item').dataset.itemId;
                this.removeItem(itemId);
            }
        });
        
        // Address changes
        document.getElementById('shippingAddress').addEventListener('change', (e) => {
            this.updateShippingAddress(e.target.value);
        });
        
        document.getElementById('billingAddress').addEventListener('change', (e) => {
            this.updateBillingAddress(e.target.value);
        });
        
        // Shipping method changes
        document.querySelectorAll('input[name="shippingMethod"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateShippingMethod(e.target.value);
            });
        });
        
        // Form submission
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder();
        });
    }

    async searchProducts(query) {
        if (query.length < 2) return;
        
        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
            const products = await response.json();
            
            this.renderProductResults(products);
        } catch (error) {
            console.error('Product search failed:', error);
            showError('Failed to search products');
        }
    }

    renderProductResults(products) {
        const container = document.getElementById('searchResults');
        container.innerHTML = products.map(product => `
            <div class="search-result" data-product-id="${product.id}">
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <small>SKU: ${product.sku}</small>
                </div>
                <div class="product-price">
                    $${product.price.toFixed(2)}
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const productId = result.dataset.productId;
                this.addItem(products.find(p => p.id === parseInt(productId)));
                container.innerHTML = '';
            });
        });
    }

    addItem(product) {
        if (this.items.has(product.id)) {
            this.updateItemQuantity(product.id, this.items.get(product.id).quantity + 1);
            return;
        }
        
        this.items.set(product.id, {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            quantity: 1
        });
        
        this.renderItems();
        this.updateTotals();
    }

    updateItemQuantity(itemId, quantity) {
        const item = this.items.get(parseInt(itemId));
        if (!item) return;
        
        if (quantity <= 0) {
            this.removeItem(itemId);
            return;
        }
        
        item.quantity = quantity;
        this.renderItems();
        this.updateTotals();
    }

    removeItem(itemId) {
        this.items.delete(parseInt(itemId));
        this.renderItems();
        this.updateTotals();
    }

    renderItems() {
        const container = document.getElementById('orderItems');
        container.innerHTML = Array.from(this.items.values()).map(item => `
            <div class="order-item" data-item-id="${item.id}">
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <small>SKU: ${item.sku}</small>
                </div>
                <div class="item-price">
                    $${item.price.toFixed(2)}
                </div>
                <div class="item-quantity">
                    <input type="number" class="form-control item-quantity" 
                           value="${item.quantity}" min="1">
                </div>
                <div class="item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <button type="button" class="btn btn-sm btn-danger remove-item">
                    Remove
                </button>
            </div>
        `).join('');
    }

    async updateTotals() {
        if (!this.shippingAddress) return;
        
        try {
            const response = await fetch('/api/orders/calculate-shipping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address_id: this.shippingAddress,
                    items: Array.from(this.items.values()).map(item => ({
                        product_id: item.id,
                        quantity: item.quantity
                    }))
                })
            });
            
            const data = await response.json();
            
            // Update shipping methods
            this.updateShippingMethods(data.shipping_methods);
            
            // Update totals
            this.updateTotalDisplay(data);
        } catch (error) {
            console.error('Failed to calculate totals:', error);
            showError('Failed to calculate order totals');
        }
    }

    async processOrder() {
        try {
            // Validate order
            if (!this.validateOrder()) {
                return;
            }
            
            // Create payment intent
            const paymentResponse = await fetch('/api/payments/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: Array.from(this.items.values()),
                    shipping_address_id: this.shippingAddress,
                    billing_address_id: this.billingAddress,
                    shipping_method: this.shippingMethod
                })
            });
            
            const { client_secret } = await paymentResponse.json();
            
            // Confirm payment
            const { error, paymentIntent } = await this.stripe.confirmCardPayment(
                client_secret,
                {
                    payment_method: {
                        card: this.elements.getElement('card'),
                        billing_details: {
                            address: {
                                postal_code: document.getElementById('billingZip').value
                            }
                        }
                    }
                }
            );
            
            if (error) {
                throw new Error(error.message);
            }
            
            // Create order
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntent.id,
                    items: Array.from(this.items.values()),
                    shipping_address_id: this.shippingAddress,
                    billing_address_id: this.billingAddress,
                    shipping_method: this.shippingMethod
                })
            });
            
            const order = await orderResponse.json();
            
            // Redirect to order confirmation
            window.location.href = `/orders/${order.id}/confirmation`;
            
        } catch (error) {
            console.error('Order processing failed:', error);
            showError(error.message || 'Failed to process order');
        }
    }

    validateOrder() {
        if (this.items.size === 0) {
            showError('Please add items to your order');
            return false;
        }
        
        if (!this.shippingAddress) {
            showError('Please select a shipping address');
            return false;
        }
        
        if (!this.billingAddress) {
            showError('Please select a billing address');
            return false;
        }
        
        if (!this.shippingMethod) {
            showError('Please select a shipping method');
            return false;
        }
        
        return true;
    }
}

// Initialize order processor
const orderProcessor = new OrderProcessor();
document.addEventListener('DOMContentLoaded', () => {
    orderProcessor.init();
}); 
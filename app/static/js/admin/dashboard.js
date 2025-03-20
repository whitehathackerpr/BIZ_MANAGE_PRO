class AdminDashboard {
    constructor() {
        this.charts = {};
        this.dateRange = {
            start: moment().subtract(30, 'days').format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD')
        };
    }

    init() {
        // Initialize date range picker
        this.initializeDateRangePicker();
        
        // Initialize charts
        this.initializeCharts();
        
        // Load initial data
        this.loadDashboardData();
        
        // Setup real-time updates
        this.setupWebSocket();
    }

    initializeDateRangePicker() {
        const self = this;
        $('#dateRange').daterangepicker({
            startDate: moment(this.dateRange.start),
            endDate: moment(this.dateRange.end),
            ranges: {
               'Today': [moment(), moment()],
               'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
               'Last 7 Days': [moment().subtract(6, 'days'), moment()],
               'Last 30 Days': [moment().subtract(29, 'days'), moment()],
               'This Month': [moment().startOf('month'), moment().endOf('month')],
               'Last Month': [moment().subtract(1, 'month').startOf('month'), 
                            moment().subtract(1, 'month').endOf('month')]
            }
        }, function(start, end) {
            self.dateRange.start = start.format('YYYY-MM-DD');
            self.dateRange.end = end.format('YYYY-MM-DD');
            self.loadDashboardData();
        });
    }

    initializeCharts() {
        // Sales trend chart
        this.charts.salesTrend = new Chart(
            document.getElementById('salesTrendChart'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Sales',
                        data: [],
                        borderColor: '#4e73df',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Top products chart
        this.charts.topProducts = new Chart(
            document.getElementById('topProductsChart'),
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Sales',
                        data: [],
                        backgroundColor: '#36b9cc'
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true
                }
            }
        );
        
        // New users chart
        this.charts.newUsers = new Chart(
            document.getElementById('newUsersChart'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'New Users',
                        data: [],
                        borderColor: '#1cc88a',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            }
        );
    }

    async loadDashboardData() {
        try {
            const response = await fetch(
                `/api/admin/dashboard?start_date=${this.dateRange.start}&end_date=${this.dateRange.end}`
            );
            const data = await response.json();
            
            this.updateSummaryMetrics(data.summary);
            this.updateCharts(data);
            this.updateTables(data);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            showError('Failed to load dashboard data');
        }
    }

    updateSummaryMetrics(summary) {
        document.getElementById('totalSales').textContent = 
            '$' + summary.total_sales.toLocaleString();
        document.getElementById('totalOrders').textContent = 
            summary.total_orders.toLocaleString();
        document.getElementById('avgOrderValue').textContent = 
            '$' + summary.avg_order_value.toLocaleString();
        document.getElementById('newUsers').textContent = 
            summary.new_users.toLocaleString();
    }

    updateCharts(data) {
        // Update sales trend chart
        this.charts.salesTrend.data.labels = 
            data.sales_trend.map(item => item.date);
        this.charts.salesTrend.data.datasets[0].data = 
            data.sales_trend.map(item => item.total);
        this.charts.salesTrend.update();
        
        // Update top products chart
        this.charts.topProducts.data.labels = 
            data.top_products.map(item => item.name);
        this.charts.topProducts.data.datasets[0].data = 
            data.top_products.map(item => item.total_sales);
        this.charts.topProducts.update();
        
        // Update new users chart
        this.charts.newUsers.data.labels = 
            data.new_users.map(item => item.date);
        this.charts.newUsers.data.datasets[0].data = 
            data.new_users.map(item => item.count);
        this.charts.newUsers.update();
    }

    updateTables(data) {
        // Update recent orders table
        const recentOrdersBody = document.getElementById('recentOrdersBody');
        recentOrdersBody.innerHTML = data.recent_orders.map(order => `
            <tr>
                <td>${order.order_number}</td>
                <td>${order.user.email}</td>
                <td>$${order.total_amount.toLocaleString()}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td>${moment(order.created_at).format('MMM D, YYYY')}</td>
                <td>
                    <a href="/admin/orders/${order.id}" class="btn btn-sm btn-primary">
                        View
                    </a>
                </td>
            </tr>
        `).join('');
        
        // Update low stock products table
        const lowStockBody = document.getElementById('lowStockBody');
        lowStockBody.innerHTML = data.low_stock_products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>${product.stock}</td>
                <td>${product.reorder_point}</td>
                <td>
                    <a href="/admin/products/${product.id}" class="btn btn-sm btn-warning">
                        Reorder
                    </a>
                </td>
            </tr>
        `).join('');
    }

    setupWebSocket() {
        const socket = io('/admin');
        
        socket.on('new_order', (order) => {
            this.handleNewOrder(order);
        });
        
        socket.on('stock_alert', (product) => {
            this.handleStockAlert(product);
        });
    }

    handleNewOrder(order) {
        // Update summary metrics
        const totalSales = parseFloat(document.getElementById('totalSales')
            .textContent.replace('$', '').replace(',', ''));
        document.getElementById('totalSales').textContent = 
            '$' + (totalSales + order.total_amount).toLocaleString();
        
        const totalOrders = parseInt(document.getElementById('totalOrders')
            .textContent.replace(',', ''));
        document.getElementById('totalOrders').textContent = 
            (totalOrders + 1).toLocaleString();
        
        // Update recent orders table
        const recentOrdersBody = document.getElementById('recentOrdersBody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${order.order_number}</td>
            <td>${order.user.email}</td>
            <td>$${order.total_amount.toLocaleString()}</td>
            <td>
                <span class="badge bg-${this.getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td>${moment(order.created_at).format('MMM D, YYYY')}</td>
            <td>
                <a href="/admin/orders/${order.id}" class="btn btn-sm btn-primary">
                    View
                </a>
            </td>
        `;
        recentOrdersBody.insertBefore(newRow, recentOrdersBody.firstChild);
        if (recentOrdersBody.children.length > 5) {
            recentOrdersBody.removeChild(recentOrdersBody.lastChild);
        }
    }

    handleStockAlert(product) {
        // Update low stock products table
        const lowStockBody = document.getElementById('lowStockBody');
        const existingRow = Array.from(lowStockBody.children)
            .find(row => row.children[1].textContent === product.sku);
        
        if (existingRow) {
            existingRow.children[2].textContent = product.stock;
        } else {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>${product.stock}</td>
                <td>${product.reorder_point}</td>
                <td>
                    <a href="/admin/products/${product.id}" class="btn btn-sm btn-warning">
                        Reorder
                    </a>
                </td>
            `;
            lowStockBody.appendChild(newRow);
        }
        
        // Show notification
        showNotification(
            'Stock Alert',
            `${product.name} has reached its reorder point.`,
            'warning'
        );
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }
}

// Initialize dashboard
const dashboard = new AdminDashboard();
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
}); 
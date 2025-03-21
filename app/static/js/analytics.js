class AnalyticsManager {
    constructor() {
        this.initializeCharts();
        this.loadData();
    }

    async initializeCharts() {
        this.revenueChart = new Chart(
            document.getElementById('revenueChart').getContext('2d'),
            this.getRevenueChartConfig()
        );

        this.productsChart = new Chart(
            document.getElementById('productsChart').getContext('2d'),
            this.getProductsChartConfig()
        );
    }

    getRevenueChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    borderColor: chartColors.primary,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    tension: 0.3
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                }
            }
        };
    }

    getProductsChartConfig() {
        return {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        chartColors.primary,
                        chartColors.success,
                        chartColors.info,
                        chartColors.warning,
                        chartColors.danger
                    ]
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        };
    }

    async loadData() {
        try {
            const response = await apiRequest('/api/analytics/dashboard');
            this.updateCharts(response);
            this.updateStats(response);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    updateCharts(data) {
        // Update Revenue Chart
        this.revenueChart.data.labels = data.revenue.labels;
        this.revenueChart.data.datasets[0].data = data.revenue.values;
        this.revenueChart.update();

        // Update Products Chart
        this.productsChart.data.labels = data.top_products.labels;
        this.productsChart.data.datasets[0].data = data.top_products.values;
        this.productsChart.update();
    }

    updateStats(data) {
        document.getElementById('monthlyRevenue').textContent = 
            formatCurrency(data.monthly_revenue);
        document.getElementById('totalProductsSold').textContent = 
            data.total_products_sold;
    }
}

// Initialize analytics manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsManager();
}); 
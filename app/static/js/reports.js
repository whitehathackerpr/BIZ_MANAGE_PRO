class ReportManager {
    constructor() {
        this.charts = {};
        this.currentReport = null;
        this.dateRange = {
            start: moment().subtract(30, 'days').format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD')
        };
    }

    init() {
        // Initialize components
        this.initializeDateRangePicker();
        this.initializeCharts();
        
        // Load initial data
        this.loadDashboardData();
        
        // Add event listeners
        this.addEventListeners();
    }

    initializeDateRangePicker() {
        const self = this;
        $('#reportDateRange').daterangepicker({
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
            self.loadReportData();
        });
    }

    initializeCharts() {
        // Sales Trend Chart
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

        // Product Performance Chart
        this.charts.productPerformance = new Chart(
            document.getElementById('productPerformanceChart'),
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Units Sold',
                        data: [],
                        backgroundColor: '#4e73df'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

        // Category Distribution Chart
        this.charts.categoryDistribution = new Chart(
            document.getElementById('categoryDistributionChart'),
            {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            }
        );
    }

    async loadReportData() {
        if (!this.currentReport) return;

        try {
            const queryParams = new URLSearchParams({
                start_date: this.dateRange.start,
                end_date: this.dateRange.end,
                report_type: this.currentReport
            });

            const response = await fetch(`/api/reports/data?${queryParams}`);
            const data = await response.json();

            this.updateCharts(data);
            this.updateSummary(data.summary);
            
            if (data.table_data) {
                this.updateDataTable(data.table_data);
            }
        } catch (error) {
            showError('Failed to load report data: ' + error.message);
        }
    }

    updateCharts(data) {
        // Update Sales Trend Chart
        if (data.sales_trend) {
            this.charts.salesTrend.data.labels = data.sales_trend.map(d => d.date);
            this.charts.salesTrend.data.datasets[0].data = data.sales_trend.map(d => d.amount);
            this.charts.salesTrend.update();
        }

        // Update Product Performance Chart
        if (data.product_performance) {
            this.charts.productPerformance.data.labels = 
                data.product_performance.map(p => p.name);
            this.charts.productPerformance.data.datasets[0].data = 
                data.product_performance.map(p => p.units_sold);
            this.charts.productPerformance.update();
        }

        // Update Category Distribution Chart
        if (data.category_distribution) {
            this.charts.categoryDistribution.data.labels = 
                data.category_distribution.map(c => c.category);
            this.charts.categoryDistribution.data.datasets[0].data = 
                data.category_distribution.map(c => c.amount);
            this.charts.categoryDistribution.update();
        }
    }

    updateSummary(summary) {
        Object.keys(summary).forEach(key => {
            const element = document.getElementById(`summary_${key}`);
            if (element) {
                if (typeof summary[key] === 'number') {
                    element.textContent = summary[key].toLocaleString();
                } else {
                    element.textContent = summary[key];
                }
            }
        });
    }

    updateDataTable(data) {
        const table = $('#reportTable').DataTable();
        table.clear();
        table.rows.add(data);
        table.draw();
    }

    exportReport(format) {
        const queryParams = new URLSearchParams({
            start_date: this.dateRange.start,
            end_date: this.dateRange.end,
            report_type: this.currentReport,
            format: format
        });

        window.location.href = `/api/reports/export?${queryParams}`;
    }

    addEventListeners() {
        // Report type selection
        document.querySelectorAll('.report-type').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentReport = e.target.dataset.report;
                this.loadReportData();
                
                // Update active state
                document.querySelectorAll('.report-type').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            });
        });

        // Export buttons
        document.getElementById('exportExcel').addEventListener('click', () => {
            this.exportReport('excel');
        });

        document.getElementById('exportPdf').addEventListener('click', () => {
            this.exportReport('pdf');
        });
    }
}

// Initialize report manager
const reportManager = new ReportManager();
document.addEventListener('DOMContentLoaded', () => {
    reportManager.init();
}); 
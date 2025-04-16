import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Space,
  DatePicker,
  Select,
  Progress,
  List,
  Tag,
  Button,
  Alert,
  Spin,
  Divider,
  Tooltip,
  Dropdown,
  Menu
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingOutlined,
  WarningOutlined,
  ReloadOutlined,
  ShopOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/plots';
import { dashboardApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { salesService } from '../services/salesService';
import { employeeService } from '../services/employeeService';
import { authService } from '../services/authService';
import type { SaleStats } from '../types/sale';
import type { Employee } from '../types/employee';
import type { User } from '../types/auth';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface DashboardData {
  salesOverview: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesGrowth: number;
    revenueGrowth: number;
  };
  inventoryStatus: {
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  };
  customerStats: {
    totalCustomers: number;
    newCustomers: number;
    customerGrowth: number;
    topCustomers: Array<{
      id: number;
      name: string;
      totalPurchases: number;
      totalSpent: number;
    }>;
  };
  financialOverview: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  recentActivities: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
  }>;
  productCategories: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [salesStats, setSalesStats] = useState<SaleStats | null>(null);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number] | null>(null);
  const currentUser = authService.getUser();

  const fetchDashboardData = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);

      const promises: Promise<any>[] = [];

      if (authService.hasPermission('canViewSales')) {
        promises.push(salesService.getStats(startDate, endDate));
      }

      if (authService.hasPermission('canViewEmployees')) {
        promises.push(employeeService.getAll({ limit: 5, sort: '-join_date' }));
      }

      const [salesData, employeesData] = await Promise.all(promises);
      
      if (salesData) {
        setSalesStats(salesData);
      }
      
      if (employeesData) {
        setRecentEmployees(employeesData);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
      fetchDashboardData(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    } else {
      setDateRange(null);
      fetchDashboardData();
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(dateRange?.[0], dateRange?.[1]);
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setLoading(true);
      const response = await salesService.export(format);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type: 'category' | 'status' | 'price', value: any) => {
    switch (type) {
      case 'category':
        setFilterCategory(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'price':
        setFilterPriceRange(value);
        break;
    }
    fetchDashboardData(dateRange?.[0], dateRange?.[1]);
  };

  const exportMenu = (
    <Menu>
      <Menu.Item 
        key="excel" 
        icon={<FileExcelOutlined />}
        onClick={() => handleExport('excel')}
      >
        Export to Excel
      </Menu.Item>
      <Menu.Item 
        key="pdf" 
        icon={<FilePdfOutlined />}
        onClick={() => handleExport('pdf')}
      >
        Export to PDF
      </Menu.Item>
    </Menu>
  );

  const renderWelcomeMessage = (user: User) => {
    return (
      <Alert
        message={`Welcome back, ${user.name}!`}
        description={`You are logged in as ${user.role}. Here's your dashboard overview.`}
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
      />
    );
  };

  const renderSalesStats = () => {
    if (!authService.hasPermission('canViewSales')) {
      return null;
    }

    return (
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={salesStats?.total_sales || 0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={salesStats?.total_revenue || 0}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={salesStats?.average_order_value || 0}
              precision={2}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={salesStats?.total_orders || 0}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderFilterOptions = () => (
    <Card style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Select
            placeholder="Filter by Category"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange('category', value)}
            allowClear
          >
            {salesStats?.category_distribution?.map(category => (
              <Option key={category.category} value={category.category}>
                {category.category}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Status"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="pending">Pending</Option>
          </Select>
          <Select
            placeholder="Price Range"
            style={{ width: 200 }}
            onChange={(value) => handleFilterChange('price', value)}
            allowClear
          >
            <Option value="low">Low ($0 - $50)</Option>
            <Option value="medium">Medium ($51 - $200)</Option>
            <Option value="high">High ($201+)</Option>
          </Select>
        </Space>
        <Space>
          <RangePicker onChange={handleDateRangeChange} />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
          <Dropdown overlay={exportMenu} placement="bottomRight">
            <Button icon={<DownloadOutlined />}>
              Export
            </Button>
          </Dropdown>
        </Space>
      </Space>
    </Card>
  );

  const renderSalesTrendChart = () => {
    if (!salesStats?.sales_trend || !authService.hasPermission('canViewSales')) {
      return null;
    }

    const config = {
      data: salesStats.sales_trend,
      xField: 'date',
      yField: 'value',
      seriesField: 'type',
      smooth: true,
      legend: {
        position: 'top',
      },
      tooltip: {
        formatter: (datum: any) => {
          return {
            name: datum.type,
            value: formatCurrency(datum.value),
          };
        },
      },
      interactions: [
        {
          type: 'element-highlight',
        },
        {
          type: 'active-region',
        },
      ],
      state: {
        active: {
          style: {
            shadowBlur: 4,
            stroke: '#000',
            fill: 'red',
          },
        },
      },
    };

    return (
      <Card 
        title={
          <Space>
            <span>Sales Trend</span>
            <Tooltip title="Shows the sales trend over time. Hover over points for details.">
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        } 
        style={{ marginTop: 24 }}
      >
        <Line {...config} />
      </Card>
    );
  };

  const renderCategoryDistribution = () => {
    if (!salesStats?.category_distribution || !authService.hasPermission('canViewSales')) {
      return null;
    }

    const config = {
      data: salesStats.category_distribution,
      angleField: 'value',
      colorField: 'category',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}',
      },
      tooltip: {
        formatter: (datum: any) => {
          return {
            name: datum.category,
            value: formatCurrency(datum.value),
            percentage: `${((datum.value / salesStats.total_revenue) * 100).toFixed(2)}%`,
          };
        },
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
      statistic: {
        title: false,
        content: {
          style: {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          content: 'Total Sales',
        },
      },
    };

    return (
      <Card 
        title={
          <Space>
            <span>Sales by Category</span>
            <Tooltip title="Shows the distribution of sales across different categories. Click on segments for details.">
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        } 
        style={{ marginTop: 24 }}
      >
        <Pie {...config} />
      </Card>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!salesStats || !authService.hasPermission('canViewSales')) {
      return null;
    }

    return (
      <Card title="Performance Metrics" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Conversion Rate"
              value={salesStats.conversion_rate}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Customer Retention"
              value={salesStats.customer_retention}
              precision={2}
              suffix="%"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Average Order Size"
              value={salesStats.average_order_size}
              precision={2}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  const renderInventoryStatus = () => {
    if (!salesStats?.inventory_status || !authService.hasPermission('canViewInventory')) {
      return null;
    }

    const { inventory_status } = salesStats;
    const lowStockPercentage = (inventory_status.low_stock_items / inventory_status.total_products) * 100;
    const outOfStockPercentage = (inventory_status.out_of_stock_items / inventory_status.total_products) * 100;

    return (
      <Card title="Inventory Status" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Total Products"
              value={inventory_status.total_products}
              prefix={<ShopOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Low Stock Items"
              value={inventory_status.low_stock_items}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Out of Stock"
              value={inventory_status.out_of_stock_items}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Total Value"
              value={inventory_status.total_value}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={12}>
            <Progress
              percent={lowStockPercentage}
              status="warning"
              format={(percent: number) => `Low Stock: ${percent}%`}
            />
          </Col>
          <Col span={12}>
            <Progress
              percent={outOfStockPercentage}
              status="exception"
              format={(percent: number) => `Out of Stock: ${percent}%`}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  const renderCustomerInsights = () => {
    if (!salesStats?.top_customers || !authService.hasPermission('canViewCustomers')) {
      return null;
    }

    const columns = [
      {
        title: 'Customer',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Total Purchases',
        dataIndex: 'total_purchases',
        key: 'total_purchases',
      },
      {
        title: 'Total Spent',
        dataIndex: 'total_spent',
        key: 'total_spent',
        render: (value: number) => formatCurrency(value),
      },
    ];

    return (
      <Card 
        title="Top Customers" 
        style={{ marginTop: 24 }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      >
        <Table
          dataSource={salesStats.top_customers}
          columns={columns}
          rowKey="customer_id"
          pagination={false}
          loading={loading}
        />
      </Card>
    );
  };

  const renderRecentEmployees = () => {
    if (!authService.hasPermission('canViewEmployees')) {
      return null;
    }

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
      },
      {
        title: 'Join Date',
        dataIndex: 'join_date',
        key: 'join_date',
        render: (date: string) => formatDate(date),
      },
    ];

    return (
      <Card 
        title="Recent Employees" 
        style={{ marginTop: 24 }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      >
        <Table
          dataSource={recentEmployees}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>
    );
  };

  const renderTopProducts = () => {
    if (!salesStats?.top_products || !authService.hasPermission('canViewSales')) {
      return null;
    }

    const columns = [
      {
        title: 'Product',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Quantity Sold',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: 'Revenue',
        dataIndex: 'revenue',
        key: 'revenue',
        render: (value: number) => formatCurrency(value),
      },
    ];

    return (
      <Card 
        title="Top Products" 
        style={{ marginTop: 24 }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      >
        <Table
          dataSource={salesStats.top_products}
          columns={columns}
          rowKey="product_id"
          pagination={false}
          loading={loading}
        />
      </Card>
    );
  };

  const renderErrorBoundary = (error: Error) => (
    <Alert
      message="Error"
      description={
        <Space direction="vertical">
          <Text>{error.message}</Text>
          <Text type="secondary">Please try refreshing the page or contact support if the issue persists.</Text>
        </Space>
      }
      type="error"
      action={
        <Space>
          <Button type="primary" onClick={handleRefresh}>
            Retry
          </Button>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Space>
      }
    />
  );

  if (loading && !refreshing) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Typography.Text style={{ marginTop: '20px', display: 'block' }}>
          Loading dashboard data...
        </Typography.Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        action={
          <Button type="primary" onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!currentUser) {
    return <Alert message="Please log in to view the dashboard" type="warning" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      {renderWelcomeMessage(currentUser)}
      {renderFilterOptions()}
      {renderSalesStats()}
      <Row gutter={24}>
        <Col span={16}>
          {renderSalesTrendChart()}
        </Col>
        <Col span={8}>
          {renderCategoryDistribution()}
        </Col>
      </Row>
      {renderPerformanceMetrics()}
      {renderInventoryStatus()}
      <Row gutter={24}>
        <Col span={12}>
          {renderTopProducts()}
        </Col>
        <Col span={12}>
          {renderRecentEmployees()}
        </Col>
      </Row>
      {renderCustomerInsights()}
    </div>
  );
};

export default Dashboard; 
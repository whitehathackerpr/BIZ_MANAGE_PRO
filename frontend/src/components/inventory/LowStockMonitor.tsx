import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Typography,
  Tag,
  message,
  Tooltip,
  Badge,
  Alert,
  Progress
} from 'antd';
import {
  WarningOutlined,
  ReloadOutlined,
  BellOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { inventoryService } from '../../services/inventoryService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CSVLink } from 'react-csv';

const { Title } = Typography;

interface LowStockItem {
  id: number;
  product_name: string;
  sku: string;
  quantity: number;
  min_quantity: number;
  category: string;
  last_updated: string;
  reorder_point: number;
  supplier: string;
}

const LowStockMonitor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchLowStockItems();
    // Set up polling every 5 minutes
    const interval = setInterval(fetchLowStockItems, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getLowStockItems();
      setLowStockItems(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch low stock items');
      message.error('Failed to fetch low stock items');
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (quantity: number, minQuantity: number) => {
    const percentage = (quantity / minQuantity) * 100;
    if (percentage <= 25) return 'error';
    if (percentage <= 50) return 'warning';
    return 'normal';
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a: LowStockItem, b: LowStockItem) =>
        a.product_name.localeCompare(b.product_name),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Current Stock',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: LowStockItem) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <span>{quantity}</span>
            <Tag color={getStockLevel(quantity, record.min_quantity)}>
              {quantity === 0 ? 'Out of Stock' : 'Low Stock'}
            </Tag>
          </Space>
          <Progress
            percent={Math.round((quantity / record.min_quantity) * 100)}
            status={getStockLevel(quantity, record.min_quantity)}
            size="small"
          />
        </Space>
      ),
      sorter: (a: LowStockItem, b: LowStockItem) => a.quantity - b.quantity,
    },
    {
      title: 'Min. Quantity',
      dataIndex: 'min_quantity',
      key: 'min_quantity',
    },
    {
      title: 'Reorder Point',
      dataIndex: 'reorder_point',
      key: 'reorder_point',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Last Updated',
      dataIndex: 'last_updated',
      key: 'last_updated',
      render: (date: string) => formatDate(date),
      sorter: (a: LowStockItem, b: LowStockItem) =>
        new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime(),
    },
  ];

  const csvData = lowStockItems.map(item => ({
    Product: item.product_name,
    SKU: item.sku,
    Category: item.category,
    'Current Stock': item.quantity,
    'Minimum Quantity': item.min_quantity,
    'Reorder Point': item.reorder_point,
    Supplier: item.supplier,
    'Last Updated': formatDate(item.last_updated)
  }));

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Title level={4}>
              <WarningOutlined style={{ color: '#faad14' }} /> Low Stock Monitor
            </Title>
            <Badge count={lowStockItems.length} color="#faad14">
              <BellOutlined style={{ fontSize: '24px' }} />
            </Badge>
          </Space>
          <Space>
            <Tooltip title="Last updated">
              <span>{formatDate(lastUpdated.toISOString())}</span>
            </Tooltip>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchLowStockItems}
              loading={loading}
            >
              Refresh
            </Button>
            <CSVLink
              data={csvData}
              filename={`low-stock-report-${formatDate(new Date().toISOString())}.csv`}
            >
              <Button icon={<ExportOutlined />}>Export</Button>
            </CSVLink>
          </Space>
        </Space>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
          />
        )}

        <Table
          columns={columns}
          dataSource={lowStockItems}
          rowKey="id"
          loading={loading}
          pagination={{
            total: lowStockItems.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
          }}
        />
      </Space>
    </Card>
  );
};

export default LowStockMonitor; 
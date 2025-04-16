import React from 'react';
import { Card, Row, Col, Statistic, Table, Button } from 'antd';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  date: string;
  amount: number;
  status: string;
}

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  dueDate: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CustomerDashboardProps {
  recentOrders: Order[];
  pendingPayments: Payment[];
  favoriteProducts: Product[];
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  recentOrders,
  pendingPayments,
  favoriteProducts,
}) => {
  const navigate = useNavigate();

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'Completed' ? '#52c41a' : '#faad14' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          View Details
        </Button>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: 'Payment ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Payment) => (
        <Button type="primary" onClick={() => navigate(`/payments/${record.id}`)}>
          Pay Now
        </Button>
      ),
    },
  ];

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Product) => (
        <Button type="link" onClick={() => navigate(`/products/${record.id}`)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={recentOrders.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Orders"
              value={recentOrders.filter(order => order.status === 'Completed').length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={recentOrders.filter(order => order.status === 'Pending').length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Payments"
              value={pendingPayments.length}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Recent Orders">
            <Table<Order>
              dataSource={recentOrders}
              columns={orderColumns}
              size="middle"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Pending Payments">
            <Table<Payment>
              dataSource={pendingPayments}
              columns={paymentColumns}
              size="middle"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Favorite Products">
            <Table<Product>
              dataSource={favoriteProducts}
              columns={productColumns}
              size="middle"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard; 
import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import {
  ShoppingCartOutlined,
  ShopOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';

interface BusinessOwnerDashboardProps {
  salesData: any[];
  inventoryData: any[];
  recentOrders: any[];
}

const BusinessOwnerDashboard: React.FC<BusinessOwnerDashboardProps> = ({
  salesData,
  inventoryData,
  recentOrders,
}) => {
  const salesConfig = {
    data: salesData,
    xField: 'date',
    yField: 'amount',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
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
    },
  ];

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={112893}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Products"
              value={56}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Employees"
              value={8}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={12}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="Sales Overview">
            <Line {...salesConfig} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Low Stock Items">
            <Table
              dataSource={inventoryData}
              columns={[
                { title: 'Product', dataIndex: 'name' },
                { title: 'Stock', dataIndex: 'stock' },
              ]}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Recent Orders">
            <Table
              dataSource={recentOrders}
              columns={columns}
              size="middle"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BusinessOwnerDashboard; 
import React from 'react';
import { Card, Row, Col, Statistic, Table, Progress } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';

interface EmployeeDashboardProps {
  tasks: any[];
  performanceData: any[];
  recentSales: any[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  tasks,
  performanceData,
  recentSales,
}) => {
  const taskColumns = [
    {
      title: 'Task',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
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
  ];

  const salesColumns = [
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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={24}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={5}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Sales"
              value={8}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Customer Interactions"
              value={15}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Performance Metrics">
            {performanceData.map((metric) => (
              <div key={metric.id} style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>{metric.name}</div>
                <Progress percent={metric.value} status={metric.status} />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Tasks">
            <Table
              dataSource={tasks}
              columns={taskColumns}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Recent Sales">
            <Table
              dataSource={recentSales}
              columns={salesColumns}
              size="middle"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard; 
import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest } from '../../types/auth';

const { Option } = Select;

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const navigate = useNavigate();

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    form.setFieldsValue({
      business_name: undefined,
      supplier_name: undefined,
      employee_id: undefined
    });
  };

  const handleSubmit = async (values: RegisterRequest) => {
    try {
      setLoading(true);
      const response = await authService.register(values);
      
      if (response.success) {
        message.success('Registration successful!');
        if (onSuccess) {
          onSuccess();
        }
        navigate('/login');
      }
    } catch (error: any) {
      message.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Register" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="role"
          label="User Type"
          rules={[{ required: true, message: 'Please select user type' }]}
        >
          <Select 
            placeholder="Select user type"
            onChange={handleRoleChange}
          >
            <Option value="business_owner">Business Owner</Option>
            <Option value="super_admin">Super Admin</Option>
            <Option value="customer">Customer</Option>
            <Option value="supplier">Supplier</Option>
            <Option value="employee">Employee</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please input your full name' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Full Name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please input your password' },
            { min: 8, message: 'Password must be at least 8 characters' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        {selectedRole === 'business_owner' && (
          <Form.Item
            name="business_name"
            label="Business Name"
            rules={[{ required: true, message: 'Please input your business name' }]}
          >
            <Input
              prefix={<ShopOutlined />}
              placeholder="Business Name"
            />
          </Form.Item>
        )}

        {selectedRole === 'supplier' && (
          <Form.Item
            name="supplier_name"
            label="Supplier Name"
            rules={[{ required: true, message: 'Please input your supplier name' }]}
          >
            <Input
              prefix={<ShopOutlined />}
              placeholder="Supplier Name"
            />
          </Form.Item>
        )}

        {selectedRole === 'employee' && (
          <Form.Item
            name="employee_id"
            label="Employee ID"
            rules={[{ required: true, message: 'Please input your employee ID' }]}
          >
            <Input
              prefix={<TeamOutlined />}
              placeholder="Employee ID"
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Register
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RegisterForm; 
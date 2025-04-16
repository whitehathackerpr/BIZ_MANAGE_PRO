import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await authService.login(values);
      
      if (response.success) {
        message.success('Login successful!');
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect based on user role
        switch (response.user.role) {
          case 'business_owner':
          case 'super_admin':
            navigate('/dashboard');
            break;
          case 'customer':
            navigate('/customer/dashboard');
            break;
          case 'supplier':
            navigate('/supplier/dashboard');
            break;
          case 'employee':
            navigate('/employee/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Login" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="userType"
          label="User Type"
          rules={[{ required: true, message: 'Please select user type' }]}
        >
          <Select placeholder="Select user type">
            <Option value="business_owner">Business Owner</Option>
            <Option value="super_admin">Super Admin</Option>
            <Option value="customer">Customer</Option>
            <Option value="supplier">Supplier</Option>
            <Option value="employee">Employee</Option>
          </Select>
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
          rules={[{ required: true, message: 'Please input your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoginForm; 
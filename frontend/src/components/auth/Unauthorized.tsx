import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLoginAsOther = () => {
    navigate('/login');
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={[
        <Button type="primary" key="dashboard" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>,
        <Button key="login" onClick={handleLoginAsOther}>
          Login as Different User
        </Button>,
      ]}
    />
  );
};

export default Unauthorized; 
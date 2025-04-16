import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products',
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: 'Inventory',
    },
    {
      key: '/sales',
      icon: <DollarOutlined />,
      label: 'Sales',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: 'Customers',
    },
    {
      key: '/suppliers',
      icon: <TeamOutlined />,
      label: 'Suppliers',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Sider
      width={250}
      className="bg-white shadow-sm"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div className="h-16 flex items-center justify-center">
        <h1 className="text-xl font-bold text-gray-800">BMP</h1>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="border-r-0"
      />
    </Sider>
  );
};

export default Sidebar; 
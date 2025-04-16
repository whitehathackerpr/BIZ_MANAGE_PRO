import { Layout, Button, Space, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: Implement logout logic
        navigate('/login');
    };

    const userMenu = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    return (
        <AntHeader className="bg-white shadow-sm flex items-center justify-between px-6">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Business Manager Pro</h1>
            </div>
            
            <Space size="middle">
                <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                    <Button type="text" className="flex items-center">
                        <Avatar icon={<UserOutlined />} />
                        <span className="ml-2">Admin</span>
                    </Button>
                </Dropdown>
            </Space>
        </AntHeader>
    );
};

export default Header; 
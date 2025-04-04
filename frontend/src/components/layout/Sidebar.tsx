import React from 'react';
import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    ShoppingCart as SalesIcon,
    People as EmployeesIcon,
    Assessment as AnalyticsIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Sales', icon: <SalesIcon />, path: '/sales' },
    { text: 'Employees', icon: <EmployeesIcon />, path: '/employees' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open, toggleDrawer }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    BizManage Pro
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => navigate(item.path)}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={toggleDrawer}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            ) : (
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            )}
        </Box>
    );
};

export default Sidebar; 
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    Notifications as NotificationsIcon,
    Assessment as AssessmentIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const drawerWidth = 240;

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { showNotification } = useNotification();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            showNotification('Logged out successfully', 'success');
            navigate('/login');
        } catch (error) {
            showNotification('Failed to logout', 'error');
        }
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Analytics', icon: <AssessmentIcon />, path: '/analytics' },
        { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
        { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
        { text: 'Branches', icon: <BusinessIcon />, path: '/branches' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ];

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" className="gradient-text">
                    BIZ MANAGE PRO
                </Typography>
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 245, 255, 0.2)',
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    background: 'rgba(19, 20, 40, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton color="inherit">
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleMenuOpen}
                        sx={{ ml: 2 }}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                            }}
                        >
                            {user?.firstName?.[0] || 'U'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                background: 'rgba(19, 20, 40, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }
                        }}
                    >
                        <MenuItem onClick={() => navigate('/profile')}>
                            <ListItemIcon>
                                <PersonIcon sx={{ color: 'primary.main' }} />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon sx={{ color: 'error.main' }} />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: 'rgba(19, 20, 40, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: 'rgba(19, 20, 40, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0A0B1E 0%, #131428 100%)',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout; 
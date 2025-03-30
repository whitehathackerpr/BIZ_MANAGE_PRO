import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = ({ open, toggleDrawer }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${240}px)` },
                ml: { sm: `${240}px` },
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={toggleDrawer}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    BizManage Pro
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton color="inherit" onClick={() => navigate('/notifications')}>
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={() => navigate('/profile')}>
                        <PersonIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 
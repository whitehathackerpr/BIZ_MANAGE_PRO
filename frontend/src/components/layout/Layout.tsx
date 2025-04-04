import React from 'react';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  People,
  ShoppingCart,
  Assessment,
  Settings,
  Notifications,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Products', icon: <ShoppingCart />, path: '/products' },
  { text: 'Analytics', icon: <Assessment />, path: '/analytics' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState<Type>(!isMobile);
  const [anchorEl, setAnchorEl] = useState<Type>(null);
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          BIZMANAGE PRO
        </Typography>
        {isMobile && (
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{
                borderRadius: '12px',
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.grey[100],
          }}
        >
          <Avatar
            src={user?.avatar}
            alt={user?.name}
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleProfileMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {user?.name?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: 'none',
                backgroundImage: 'none',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="persistent"
            open={drawerOpen}
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: 'none',
                backgroundImage: 'none',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout; 
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';
import LanguageSelector from '../LanguageSelector';

const drawerWidth = 240;

const menuItems = [
  { path: '/dashboard', icon: <DashboardIcon />, label: 'dashboard' },
  { path: '/products', icon: <ShoppingCartIcon />, label: 'products' },
  { path: '/orders', icon: <InventoryIcon />, label: 'orders' },
  { path: '/reports', icon: <AssessmentIcon />, label: 'reports' },
  { path: '/settings', icon: <SettingsIcon />, label: 'settings' },
];

const MainLayout = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const { user, logout, themeMode, toggleTheme } = useStore();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t(location.pathname.substring(1) || 'dashboard')}
          </Typography>
          <LanguageSelector />
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Tooltip title={t('profile')}>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
            >
              <Avatar
                alt={user?.name}
                src={user?.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                }}
              >
                {user?.name?.[0]}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={open}
          onClose={handleDrawerToggle}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={t(item.label)} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate('/profile')}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('profile')} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('logout')} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {t('profile')}
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('logout')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout; 
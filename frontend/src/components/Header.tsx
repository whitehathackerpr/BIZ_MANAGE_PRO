import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app';
import { logout } from '../features/auth/authSlice';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchorEl, setNotificationMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);
  const isNotificationMenuOpen = Boolean(notificationMenuAnchorEl);

  const handleLogout = () => {
    handleCloseUserMenu();
    dispatch(logout());
  };

  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchorEl(null);
  };

  const handleOpenNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchorEl(event.currentTarget);
  };

  const handleCloseNotificationMenu = () => {
    setNotificationMenuAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseMobileMenu();
    handleCloseUserMenu();
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo and brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleOpenMobileMenu}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <BusinessIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: 32 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/dashboard"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              BIZ MANAGE PRO
            </Typography>
            
            <BusinessIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/dashboard"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: '.05rem',
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              BIZ MANAGE
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard"
              sx={{ mx: 1, fontWeight: 600 }}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/analytics"
              sx={{ mx: 1, fontWeight: 600 }}
            >
              Analytics
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/reports"
              sx={{ mx: 1, fontWeight: 600 }}
            >
              Reports
            </Button>
            {user?.role === 'owner' && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/business"
                sx={{ mx: 1, fontWeight: 600 }}
              >
                Business
              </Button>
            )}
          </Box>

          {/* Right side actions - Notifications and User menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user && (
              <>
                <Tooltip title="Notifications">
                  <IconButton 
                    size="large" 
                    color="inherit"
                    onClick={handleOpenNotificationMenu}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    size="large"
                    edge="end"
                    color="inherit"
                    sx={{ ml: 2 }}
                  >
                    <Avatar 
                      alt={user.name || 'User'}
                      src={user.avatar}
                      sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                    >
                      {user.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            )}
            {!user && (
              <Button 
                component={RouterLink}
                to="/login"
                color="inherit"
                variant="outlined"
                sx={{ 
                  ml: 2,
                  borderColor: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.08)' }
                }}
              >
                Login
              </Button>
            )}
          </Box>

          {/* Mobile menu */}
          <Menu
            anchorEl={mobileMenuAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={isMobileMenuOpen}
            onClose={handleCloseMobileMenu}
            sx={{ 
              display: { xs: 'block', md: 'none' } 
            }}
          >
            <MenuItem onClick={() => handleNavigate('/dashboard')}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Dashboard</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/analytics')}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Analytics</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/reports')}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Reports</ListItemText>
            </MenuItem>
            {user?.role === 'owner' && (
              <MenuItem onClick={() => handleNavigate('/business')}>
                <ListItemIcon>
                  <BusinessIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText>Business</ListItemText>
              </MenuItem>
            )}
          </Menu>

          {/* User menu */}
          <Menu
            anchorEl={userMenuAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={isUserMenuOpen}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => handleNavigate('/profile')}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>

          {/* Notification menu */}
          <Menu
            anchorEl={notificationMenuAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={isNotificationMenuOpen}
            onClose={handleCloseNotificationMenu}
            PaperProps={{
              sx: { 
                width: 320,
                maxHeight: 400,
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    // Mark all as read functionality would go here
                    handleCloseNotificationMenu();
                  }}
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  Mark all as read
                </Link>
              )}
            </Box>
            <Divider />
            {/* This would be populated with actual notifications */}
            <MenuItem onClick={() => handleNavigate('/notifications')}>
              <Typography variant="body2" color="primary">
                See all notifications
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 
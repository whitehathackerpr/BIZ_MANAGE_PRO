import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app';
import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import StoreIcon from '@mui/icons-material/Store';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';
import PieChartIcon from '@mui/icons-material/PieChart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// Define a type for our navigation items
type NavigationItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
  subItems?: NavigationItem[];
  roles?: string[];
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(true);
  const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>({});

  const handleToggleSubmenu = (label: string) => {
    setExpandedSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // All navigation items with their MUI icons and role-based access
  const allNavigationItems: NavigationItem[] = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <DashboardIcon />,
      roles: ['owner', 'staff', 'admin'] 
    },
    { 
      path: '/business', 
      label: 'Business', 
      icon: <BusinessIcon />,
      roles: ['owner', 'admin'],
      subItems: [
        { path: '/business', label: 'Overview', icon: <BusinessIcon /> },
        { path: '/branches', label: 'Branches', icon: <LocationOnIcon /> },
      ]
    },
    { 
      path: '/products', 
      label: 'Products', 
      icon: <StoreIcon />,
      roles: ['owner', 'staff', 'supplier', 'admin'] 
    },
    { 
      path: '/inventory', 
      label: 'Inventory', 
      icon: <InventoryIcon />,
      roles: ['owner', 'staff', 'supplier', 'admin'] 
    },
    { 
      path: '/employees', 
      label: 'Employees', 
      icon: <PeopleIcon />,
      roles: ['owner', 'admin'] 
    },
    { 
      path: '/suppliers', 
      label: 'Suppliers', 
      icon: <LocalShippingIcon />,
      roles: ['owner', 'staff', 'admin'] 
    },
    { 
      path: '/customers', 
      label: 'Customers', 
      icon: <PersonIcon />,
      roles: ['owner', 'staff', 'admin'] 
    },
    { 
      path: '/transactions', 
      label: 'Transactions', 
      icon: <ReceiptIcon />,
      roles: ['owner', 'staff', 'admin'] 
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: <AssessmentIcon />,
      roles: ['owner', 'staff', 'supplier', 'admin'] 
    },
    { 
      path: '/orders', 
      label: 'Orders', 
      icon: <ShoppingCartIcon />,
      roles: ['customer', 'supplier', 'owner', 'staff'] 
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: <AnalyticsIcon />,
      roles: ['owner', 'staff', 'supplier', 'admin'] 
    },
    { 
      path: '/performance', 
      label: 'Performance', 
      icon: <PieChartIcon />,
      roles: ['owner', 'admin'] 
    },
    { 
      path: '/recommendations', 
      label: 'Recommendations', 
      icon: <StarIcon />,
      roles: ['owner', 'staff', 'customer'] 
    },
    { 
      path: '/submit-review', 
      label: 'Write Review', 
      icon: <EditIcon />,
      roles: ['customer'] 
    },
    { 
      path: '/support', 
      label: 'Support', 
      icon: <SupportAgentIcon />,
      roles: ['customer', 'supplier', 'staff'] 
    },
  ];

  // Portal pages for different user roles
  const portalRoutes: Record<string, string> = {
    owner: '/dashboard',
    staff: '/staff-portal',
    supplier: '/supplier-portal',
    customer: '/customer-portal'
  };
  
  // Filter navigation items based on user role
  const userRole = user?.role || 'guest';
  let navigationItems = allNavigationItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  // Add role-specific dashboard items at the top
  if (userRole in portalRoutes && userRole !== 'owner') {
    navigationItems = [
      { 
        path: portalRoutes[userRole],
        label: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard`,
        icon: <DashboardIcon />
      },
      ...navigationItems.filter(item => item.path !== '/dashboard')
    ];
  }

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Determine if a navigation item is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawerWidth = open ? 240 : 64;

  // Render a navigation item or submenu
  const renderNavItem = (item: NavigationItem, depth = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isSubmenuExpanded = expandedSubmenus[item.label] || false;
    const isItemActive = isActive(item.path);
    
    return (
      <React.Fragment key={item.path}>
        <ListItem 
          disablePadding
          sx={{ 
            display: 'block',
            my: 0.5,
          }}
        >
          <ListItemButton
            onClick={() => {
              if (hasSubItems) {
                handleToggleSubmenu(item.label);
              } else {
                handleNavigate(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              backgroundColor: isItemActive && !hasSubItems ? 'primary.main' : 'transparent',
              color: isItemActive && !hasSubItems ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: isItemActive && !hasSubItems ? 'primary.dark' : 'action.hover',
              },
              ml: depth * 2,
            }}
          >
            <Tooltip title={!open ? item.label : ''} placement="right" arrow>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: isItemActive && !hasSubItems ? 'white' : 'primary.main',
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            {open && (
              <>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isItemActive ? 600 : 400,
                    noWrap: true
                  }}
                />
                {hasSubItems && (isSubmenuExpanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {hasSubItems && open && (
          <Collapse in={isSubmenuExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems!.map(subItem => renderNavItem(subItem, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding: theme => theme.spacing(2, 1),
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        {open && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700, ml: 1 }}
          >
            BizManage Pro
          </Typography>
        )}
        <IconButton onClick={() => setOpen(!open)} sx={{ color: 'white' }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ px: 1, pt: 2 }}>
        {navigationItems.map(item => renderNavItem(item))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      
      {user && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
            mt: 'auto',
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'secondary.main',
              width: 40,
              height: 40,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            {user.name?.charAt(0) || 'U'}
          </Avatar>
          
          {open && (
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {user.name || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  textTransform: 'capitalize',
                  display: 'block'
                }}
              >
                {user.role || 'User'}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
import React from 'react';
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip
} from '@mui/material';
import {
  Store as StoreIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Cloud as CloudIcon,
  Devices as DevicesIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const features = [
  {
    title: 'Inventory Management',
    description: 'Track stock levels, manage suppliers, and automate reordering with our advanced inventory system.',
    icon: <InventoryIcon sx={{ fontSize: 40 }} />,
    color: '#1976d2'
  },
  {
    title: 'Sales Tracking',
    description: 'Monitor sales performance, generate invoices, and track revenue with detailed analytics.',
    icon: <MoneyIcon sx={{ fontSize: 40 }} />,
    color: '#2e7d32'
  },
  {
    title: 'Employee Management',
    description: 'Manage staff schedules, track attendance, and handle payroll efficiently.',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    color: '#ed6c02'
  },
  {
    title: 'Business Analytics',
    description: 'Get insights into your business performance with comprehensive reporting and analytics.',
    icon: <TimelineIcon sx={{ fontSize: 40 }} />,
    color: '#9c27b0'
  }
];

const benefits = [
  'Real-time inventory tracking and management',
  'Automated sales and purchase order processing',
  'Comprehensive financial reporting and analytics',
  'Employee time tracking and attendance management',
  'Multi-branch support with centralized control',
  'Secure data storage and backup',
  'Mobile-friendly interface',
  '24/7 customer support'
];

const testimonials = [
  {
    name: 'John Smith',
    position: 'CEO, Tech Solutions Inc.',
    avatar: 'JS',
    text: 'BizManage Pro has transformed how we run our business. The automation and analytics have saved us countless hours.'
  },
  {
    name: 'Sarah Johnson',
    position: 'Operations Manager, Retail Plus',
    avatar: 'SJ',
    text: 'The multi-branch support and real-time tracking have made managing our retail chain much easier.'
  },
  {
    name: 'Michael Chen',
    position: 'Owner, Quick Mart',
    avatar: 'MC',
    text: 'The inventory management system is a game-changer. We've reduced stockouts by 80%.'
  }
];

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #21CBF3 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                  >
                    Streamline Your Business Operations
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ mb: 4, opacity: 0.9 }}
                  >
                    All-in-one business management solution for inventory, sales, employees, and analytics.
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'grey.100'
                        }
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{ color: 'white', borderColor: 'white' }}
                    >
                      Watch Demo
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Box
                  component="img"
                  src="/dashboard-preview.png"
                  alt="Dashboard Preview"
                  sx={{
                    width: '100%',
                    maxWidth: 600,
                    borderRadius: 2,
                    boxShadow: 3,
                    display: { xs: 'none', md: 'block' }
                  }}
                />
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Powerful Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Slide
                direction="up"
                in
                timeout={1000}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        color: feature.color,
                        mb: 2
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h3"
                    component="h2"
                    gutterBottom
                  >
                    Why Choose BizManage Pro?
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 4 }}
                  >
                    Our comprehensive solution helps businesses of all sizes streamline their operations and make data-driven decisions.
                  </Typography>
                  <List>
                    {benefits.map((benefit, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={benefit} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Box
                  component="img"
                  src="/features-preview.png"
                  alt="Features Preview"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                />
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          What Our Clients Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Slide
                direction="up"
                in
                timeout={1000}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.position}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1">
                      "{testimonial.text}"
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #21CBF3 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Ready to Transform Your Business?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Join thousands of businesses already using BizManage Pro
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                BizManage Pro
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Streamline your business operations with our comprehensive management solution.
              </Typography>
              <Box display="flex" gap={2}>
                <IconButton color="inherit">
                  <GitHubIcon />
                </IconButton>
                <IconButton color="inherit">
                  <LinkedInIcon />
                </IconButton>
                <IconButton color="inherit">
                  <TwitterIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="inherit" />
                  </ListItemIcon>
                  <ListItemText primary="support@bizmanagepro.com" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="inherit" />
                  </ListItemIcon>
                  <ListItemText primary="+1 (555) 123-4567" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="inherit" />
                  </ListItemIcon>
                  <ListItemText primary="123 Business Ave, Suite 100" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <List>
                <ListItem button component={RouterLink} to="/about">
                  <ListItemText primary="About Us" />
                </ListItem>
                <ListItem button component={RouterLink} to="/features">
                  <ListItemText primary="Features" />
                </ListItem>
                <ListItem button component={RouterLink} to="/pricing">
                  <ListItemText primary="Pricing" />
                </ListItem>
                <ListItem button component={RouterLink} to="/contact">
                  <ListItemText primary="Contact" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} BizManage Pro. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 
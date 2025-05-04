import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const roles = [
  {
    name: 'Business Owner',
    icon: <StoreIcon fontSize="large" color="success" />,
    desc: 'Manage employees, track performance, and grow your business.',
    link: '/register?role=owner',
    badge: 'Most Popular',
  },
  {
    name: 'Customer',
    icon: <PersonIcon fontSize="large" color="success" />,
    desc: 'Access tailored products, manage orders, and enjoy exclusive offers.',
    link: '/register?role=customer',
    badge: '',
  },
  {
    name: 'Supplier',
    icon: <ShoppingCartIcon fontSize="large" color="success" />,
    desc: 'Connect with businesses, fulfill stock needs, and streamline supply.',
    link: '/register?role=supplier',
    badge: 'New',
  },
  {
    name: 'Staff/Cashier',
    icon: <GroupIcon fontSize="large" color="success" />,
    desc: 'Simplify transactions and manage daily operations efficiently.',
    link: '/register?role=staff',
    badge: '',
  },
];

const steps = [
  {
    icon: <HowToRegIcon color="success" fontSize="large" />,
    title: 'Choose Role',
    description: 'Select the portal that fits your needs.'
  },
  {
    icon: <CheckCircleIcon color="success" fontSize="large" />,
    title: 'Register',
    description: 'Create your account in seconds.'
  },
  {
    icon: <BuildCircleIcon color="success" fontSize="large" />,
    title: 'Manage',
    description: 'Utilize powerful tools for your business.'
  },
  {
    icon: <TrendingUpIcon color="success" fontSize="large" />,
    title: 'Grow',
    description: 'Leverage AI insights and reports.'
  },
];

// New LandingHeader component
const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      color="transparent" 
      sx={{ 
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}
    >
      <Toolbar sx={{ p: { xs: 1, sm: 2 } }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
          {/* Left side - Logo and name */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ 
              fontSize: { xs: 32, sm: 36, md: 40 }, 
              color: 'success.main', 
              mr: { xs: 1, sm: 1.5 } 
            }} />
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 800,
                letterSpacing: 1,
                color: 'text.primary',
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'column' },
                lineHeight: 1.1,
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.75rem' },
                gap: { xs: 1, sm: 0 }
              }}
            >
              <Box component="span" sx={{ color: 'success.main' }}>BIZ</Box>
              <Box component="span">MANAGE PRO</Box>
            </Typography>
          </Box>
          
          {/* Right side - Navigation links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              Features <KeyboardArrowDownIcon />
            </Button>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              Pricing
            </Button>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              About
            </Button>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              Contact
            </Button>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="outlined" 
              color="success"
              sx={{ ml: 1, borderRadius: 2, fontWeight: 700 }}
            >
              Login
            </Button>
            <Button 
              component={RouterLink} 
              to="/register" 
              variant="contained" 
              color="success"
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Sign Up
            </Button>
          </Box>
          
          {/* Mobile menu button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="outlined" 
              color="success"
              size="small"
              sx={{ mr: 1, borderRadius: 2, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Login
            </Button>
            <Button 
              component={RouterLink} 
              to="/register" 
              variant="contained" 
              color="success"
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Sign Up
            </Button>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default function LandingPage() {
  const theme = useTheme();
  return (
    <Box sx={{ bgcolor: '#f7fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Landing page header */}
      <LandingHeader />
      
      {/* Hero Section - with gradient background */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #f7fafc 0%, #e3f2fd 100%)',
          pt: { xs: 8, md: 12 }, 
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorative elements */}
        <Box 
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46, 125, 50, 0.1) 0%, rgba(46, 125, 50, 0.05) 70%, rgba(46, 125, 50, 0) 100%)',
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46, 125, 50, 0.08) 0%, rgba(46, 125, 50, 0.03) 70%, rgba(46, 125, 50, 0) 100%)',
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6} component="div">
              <Fade in timeout={800}>
                <Box>
                  <Typography 
                    variant="h2" 
                    fontWeight={800} 
                    color="text.primary" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Simplify Business Operations for Everyone
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      mb: 3, 
                      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                      fontWeight: 500
                    }}
                  >
                    One platform. Four powerful portals. Endless possibilities.
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 }, 
                    mt: { xs: 3, sm: 5 }, 
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-start' } 
                  }}>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      color="success"
                      size="large"
                      sx={{ 
                        fontWeight: 700, 
                        px: { xs: 3, sm: 4 }, 
                        py: 1.5,
                        borderRadius: 2, 
                        boxShadow: '0 4px 14px 0 rgba(46, 125, 50, 0.39)',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        flex: { xs: '1 1 100%', sm: '0 1 auto' }
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="outlined"
                      color="success"
                      size="large"
                      sx={{ 
                        fontWeight: 700, 
                        px: { xs: 3, sm: 4 }, 
                        py: 1.5,
                        borderRadius: 2, 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        flex: { xs: '1 1 100%', sm: '0 1 auto' }
                      }}
                    >
                      Login
                    </Button>
                  </Box>
                  <Box sx={{ 
                    mt: 5, 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center', 
                    maxWidth: 500,
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: '100%'
                  }}>
                    <TextField
                      fullWidth
                      placeholder="Search features, help, or guides..."
                      variant="outlined"
                      size="medium"
                      sx={{ 
                        bgcolor: 'white', 
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    />
                    <Button 
                      variant="contained" 
                      color="success" 
                      sx={{ 
                        borderRadius: 2, 
                        px: { xs: 2, sm: 4 }, 
                        py: 1.5,
                        fontWeight: 700,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Search
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6} component="div">
              <Fade in timeout={1200}>
                <Box display="flex" justifyContent="center">
                  <img
                    src="/assets/hero-illustration.svg"
                    alt="Business Management Illustration"
                    style={{ width: '100%', maxWidth: 500, height: 'auto' }}
                  />
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works - with card background */}
      <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 }, position: 'relative', zIndex: 2 }}>
        <Container maxWidth="md">
          <Typography 
            variant="h4" 
            fontWeight={800} 
            color="text.primary" 
            align="center" 
            mb={6}
            sx={{ 
              position: 'relative',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
            }}
          >
            How It Works
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: -10, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: 60, 
                height: 3, 
                bgcolor: 'success.main', 
                borderRadius: 2 
              }} 
            />
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {steps.map((step, idx) => (
              <Grid component="div" item xs={12} sm={6} md={3} key={idx}>
                <Fade in timeout={600 + idx * 200}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 3,
                        borderColor: 'success.light'
                      }
                    }}
                  >
                    <Box 
                      mb={2} 
                      sx={{ 
                        bgcolor: 'success.light', 
                        width: { xs: 56, sm: 64 }, 
                        height: { xs: 56, sm: 64 }, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mx: 'auto',
                        color: 'white'
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Popular Portals (Roles) */}
      <Box sx={{ bgcolor: '#f7fafc', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            fontWeight={800} 
            color="text.primary" 
            align="center" 
            mb={2}
            sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}
          >
            Popular Portals
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            align="center" 
            mb={6}
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            Choose the portal that fits your role and take control of your business operations
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {roles.map((role, idx) => (
              <Grid component="div" item xs={12} sm={6} md={3} key={role.name}>
                <Fade in timeout={600 + idx * 200}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      borderRadius: 4, 
                      p: { xs: 2, sm: 3 }, 
                      position: 'relative', 
                      minHeight: { xs: 'auto', md: 320 }, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    {role.badge && (
                      <Chip 
                        label={role.badge} 
                        color="success" 
                        size="small" 
                        sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 700 }} 
                      />
                    )}
                    <Box 
                      mt={4} 
                      mb={2} 
                      sx={{ 
                        bgcolor: 'success.light', 
                        width: { xs: 60, sm: 70 }, 
                        height: { xs: 60, sm: 70 }, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      {role.icon}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', width: '100%' }}>
                      <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                        {role.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {role.desc}
                      </Typography>
                    </CardContent>
                    <Button
                      component={RouterLink}
                      to={role.link}
                      variant="contained"
                      color="success"
                      fullWidth
                      sx={{ 
                        borderRadius: 2, 
                        fontWeight: 700, 
                        mb: 2,
                        py: 1
                      }}
                    >
                      Join as {role.name.split(' ')[0]}
                    </Button>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Promotional Banner */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: 'white', 
          py: { xs: 8, md: 10 }, 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorative elements */}
        <Box 
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: { xs: 120, sm: 200 },
            height: { xs: 120, sm: 200 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 70%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: { xs: 80, sm: 150 },
            height: { xs: 80, sm: 150 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 70%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
        
        <Container maxWidth="sm">
          <Typography 
            variant="h3" 
            fontWeight={800} 
            mb={2}
            sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}
          >
            Ready to Transform Your Business?
          </Typography>
          <Typography 
            variant="h6" 
            color="rgba(255,255,255,0.85)" 
            mb={5} 
            fontWeight={400}
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, px: { xs: 2, sm: 0 } }}
          >
            Join hundreds of businesses simplifying operations and driving growth with BizManage Pro.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="inherit"
            size="large"
            sx={{ 
              color: 'success.main', 
              bgcolor: 'white', 
              fontWeight: 700, 
              px: { xs: 4, sm: 6 }, 
              py: 1.5,
              borderRadius: 2, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)', 
              '&:hover': { 
                bgcolor: '#f1f5f9',
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              width: { xs: 'calc(100% - 32px)', sm: 'auto' }
            }}
          >
            Start Your Free Trial
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#22292f', color: 'grey.300', py: { xs: 6, md: 10 }, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid component="div" item xs={12} md={4}>
              <Box display="flex" alignItems="center" mb={3}>
                <BusinessIcon fontSize="large" color="success" sx={{ mr: 1.5, fontSize: { xs: 32, md: 40 } }} />
                <Typography 
                  variant="h4" 
                  color="white" 
                  fontWeight={800} 
                  sx={{ 
                    letterSpacing: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } 
                  }}
                >
                  <Box component="span" sx={{ color: '#4caf50' }}>BIZ</Box>
                  <Box component="span">MANAGE</Box>
                </Typography>
              </Box>
              <Typography variant="body2" color="grey.400" paragraph>
                Streamlining business operations for owners, staff, suppliers, and customers with our all-in-one management platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: '#4caf50' } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: '#4caf50' } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: '#4caf50' } }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: '#4caf50' } }}>
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid component="div" item xs={6} sm={6} md={2}>
              <Typography variant="subtitle1" color="white" fontWeight={700} mb={3}>Company</Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>About Us</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Team</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Careers</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Blog</Button></Box>
              </Box>
            </Grid>
            
            <Grid component="div" item xs={6} sm={6} md={2}>
              <Typography variant="subtitle1" color="white" fontWeight={700} mb={3}>Resources</Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Documentation</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Help Center</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Tutorials</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>API Reference</Button></Box>
              </Box>
            </Grid>
            
            <Grid component="div" item xs={6} sm={6} md={2}>
              <Typography variant="subtitle1" color="white" fontWeight={700} mb={3}>Legal</Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Privacy Policy</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Terms of Service</Button></Box>
                <Box component="li" mb={1.5}><Button sx={{ color: '#b9f6ca', textDecoration: 'none', p: 0, textTransform: 'none', fontWeight: 400, justifyContent: 'flex-start' }}>Cookie Policy</Button></Box>
              </Box>
            </Grid>
            
            <Grid component="div" item xs={6} sm={6} md={2}>
              <Typography variant="subtitle1" color="white" fontWeight={700} mb={3}>Contact</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon fontSize="small" sx={{ color: '#4caf50', mr: 1 }} />
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>support@bizmanagepro.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon fontSize="small" sx={{ color: '#4caf50', mr: 1 }} />
                  <Typography variant="body2">+1 (800) 123-4567</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 6, pt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="grey.500">
              © {new Date().getFullYear()} BizManage Pro. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 
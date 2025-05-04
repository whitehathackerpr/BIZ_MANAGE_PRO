import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app';
import { Box, styled } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NotificationsHandler from '../components/NotificationsHandler';

interface MainLayoutProps {
  children: ReactNode;
}

// Create a styled component for the main content area
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100%',
  overflow: 'auto',
  backgroundColor: theme.palette.background.default
}));

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Real-time notifications handler - invisible component */}
      <NotificationsHandler />
      
      {/* Toast notifications container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
        <Header />
        
        <MainContent>
          {children}
        </MainContent>
      </Box>
    </Box>
  );
};

export default MainLayout; 
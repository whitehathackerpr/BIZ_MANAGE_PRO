import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import AccountSettings from '../components/settings/AccountSettings';
import BusinessSettings from '../components/settings/BusinessSettings';
import SystemSettings from '../components/settings/SystemSettings';
import {
  getUserProfile,
  getBusinessSettings,
  getSystemSettings,
} from '../services/settingsService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Settings() {
  const [activeTab, setActiveTab] = useState(0);

  // Fetch settings data
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  const { data: businessSettings, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: getBusinessSettings,
  });

  const { data: systemSettings, isLoading: isLoadingSystem } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (isLoadingProfile || isLoadingBusiness || isLoadingSystem) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            icon={<SecurityIcon />}
            label="Account"
          />
          <Tab
            icon={<BusinessIcon />}
            label="Business"
          />
          <Tab
            icon={<SettingsIcon />}
            label="System"
          />
        </Tabs>
      </Paper>

      <Paper>
        <TabPanel value={activeTab} index={0}>
          <AccountSettings userProfile={userProfile} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <BusinessSettings businessSettings={businessSettings} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <SystemSettings systemSettings={systemSettings} />
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default Settings; 
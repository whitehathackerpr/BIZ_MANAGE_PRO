import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Backup as BackupIcon,
} from '@mui/icons-material';
import './Settings.css';

const Settings = () => {
  return (
    <Box className="settings-container">
      <Typography variant="h4" component="h1" className="settings-title">
        Settings
      </Typography>

      <Paper className="settings-section">
        <Typography variant="h6" component="h2" className="section-title">
          Account Settings
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive notifications about your account activity"
            />
            <Switch defaultChecked />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText
              primary="Two-Factor Authentication"
              secondary="Add an extra layer of security to your account"
            />
            <Switch />
          </ListItem>
        </List>
      </Paper>

      <Paper className="settings-section">
        <Typography variant="h6" component="h2" className="section-title">
          Appearance
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <PaletteIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dark Mode"
              secondary="Switch between light and dark theme"
            />
            <Switch />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText
              primary="Language"
              secondary="Change the interface language"
            />
            <Button variant="outlined" size="small">
              English
            </Button>
          </ListItem>
        </List>
      </Paper>

      <Paper className="settings-section">
        <Typography variant="h6" component="h2" className="section-title">
          Data Management
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <BackupIcon />
            </ListItemIcon>
            <ListItemText
              primary="Data Export"
              secondary="Export your account data"
            />
            <Button variant="outlined" size="small">
              Export
            </Button>
          </ListItem>
        </List>
      </Paper>

      <Box className="settings-actions">
        <Button variant="contained" color="primary">
          Save Changes
        </Button>
        <Button variant="outlined" color="error">
          Reset to Default
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 
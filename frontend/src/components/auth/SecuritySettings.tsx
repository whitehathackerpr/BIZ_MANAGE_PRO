import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Security as SecurityIcon,
  Block as BlockIcon,
  Fingerprint as FingerprintIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const SecuritySettings = () => {
  const [loading, setLoading] = useState<Type>(false);
  const [ipBlockingEnabled, setIpBlockingEnabled] = useState<Type>(false);
  const [deviceFingerprintingEnabled, setDeviceFingerprintingEnabled] = useState<Type>(false);
  const [blockedIPs, setBlockedIPs] = useState<Type>([]);
  const [showAddIPDialog, setShowAddIPDialog] = useState<Type>(false);
  const [newIP, setNewIP] = useState<Type>('');
  const [deviceFingerprint, setDeviceFingerprint] = useState<Type>(null);
  const { updateSecuritySettings, getSecuritySettings } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadSecuritySettings();
    generateDeviceFingerprint();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const settings = await getSecuritySettings();
      setIpBlockingEnabled(settings.ipBlockingEnabled);
      setDeviceFingerprintingEnabled(settings.deviceFingerprintingEnabled);
      setBlockedIPs(settings.blockedIPs);
    } catch (error) {
      showNotification(error.message || 'Failed to load security settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceFingerprint = async () => {
    try {
      const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.width + 'x' + screen.height,
        navigator.hardwareConcurrency,
        navigator.deviceMemory
      ];
      
      const fingerprint = await crypto.subtle.digest('SHA-256', 
        new TextEncoder().encode(components.join('|'))
      );
      
      setDeviceFingerprint(Array.from(new Uint8Array(fingerprint))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error);
    }
  };

  const handleToggleIPBlocking = async () => {
    try {
      setLoading(true);
      await updateSecuritySettings({
        ipBlockingEnabled: !ipBlockingEnabled
      });
      setIpBlockingEnabled(!ipBlockingEnabled);
      showNotification('IP blocking settings updated', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to update IP blocking settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDeviceFingerprinting = async () => {
    try {
      setLoading(true);
      await updateSecuritySettings({
        deviceFingerprintingEnabled: !deviceFingerprintingEnabled
      });
      setDeviceFingerprintingEnabled(!deviceFingerprintingEnabled);
      showNotification('Device fingerprinting settings updated', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to update device fingerprinting settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIP = async () => {
    if (!newIP || !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(newIP)) {
      showNotification('Please enter a valid IP address', 'error');
      return;
    }

    try {
      setLoading(true);
      const updatedIPs = [...blockedIPs, newIP];
      await updateSecuritySettings({
        blockedIPs: updatedIPs
      });
      setBlockedIPs(updatedIPs);
      setNewIP('');
      setShowAddIPDialog(false);
      showNotification('IP address added to block list', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to add IP address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIP = async (ip) => {
    try {
      setLoading(true);
      const updatedIPs = blockedIPs.filter(i => i !== ip);
      await updateSecuritySettings({
        blockedIPs: updatedIPs
      });
      setBlockedIPs(updatedIPs);
      showNotification('IP address removed from block list', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to remove IP address', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SecurityIcon color="primary" />
        <Typography variant="h6">Security Settings</Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={ipBlockingEnabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToggleIPBlocking}
            disabled={loading}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BlockIcon />
            <Typography>Enable IP-based Blocking</Typography>
          </Box>
        }
      />

      {ipBlockingEnabled && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="subtitle1">Blocked IP Addresses</Typography>
            <IconButton
              color="primary"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowAddIPDialog(true)}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Box>
          <List>
            {blockedIPs.map((ip) => (
              <ListItem key={ip}>
                <ListItemText primary={ip} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleRemoveIP(ip)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={deviceFingerprintingEnabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToggleDeviceFingerprinting}
            disabled={loading}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FingerprintIcon />
            <Typography>Enable Device Fingerprinting</Typography>
          </Box>
        }
      />

      {deviceFingerprintingEnabled && deviceFingerprint && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Your device fingerprint: {deviceFingerprint.slice(0, 16)}...
        </Alert>
      )}

      <Dialog
        open={showAddIPDialog}
        onClose={() => setShowAddIPDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Blocked IP Address</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="IP Address"
            type="text"
            fullWidth
            value={newIP}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setNewIP(e.target.value)}
            placeholder="e.g., 192.168.1.1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowAddIPDialog(false)}>Cancel</Button>
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleAddIP}
            variant="contained"
            disabled={loading || !newIP}
          >
            {loading ? <CircularProgress size={24} /> : 'Add IP'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SecuritySettings; 
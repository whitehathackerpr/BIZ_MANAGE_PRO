import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';

const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
];

const LanguageSelector = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { i18n } = useTranslation();
  const { language, setLanguage } = useStore();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
    document.dir = languages.find(lang => lang.code === langCode)?.dir || 'ltr';
    handleClose();
  };

  return (
    <>
      <Tooltip title="Change Language">
        <IconButton
          onClick={handleClick}
          color="inherit"
          sx={{ ml: 1 }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={language === lang.code}
          >
            <ListItemIcon>
              {language === lang.code && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={lang.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector; 
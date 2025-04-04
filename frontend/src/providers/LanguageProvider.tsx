import React from 'react';
import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import useStore from '../store/useStore';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'muiltr',
});

// Initialize i18next
i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          dashboard: 'Dashboard',
          products: 'Products',
          orders: 'Orders',
          customers: 'Customers',
          analytics: 'Analytics',
          settings: 'Settings',
          profile: 'Profile',
          logout: 'Logout',
          // Add more translations
        },
      },
      ar: {
        translation: {
          dashboard: 'لوحة القيادة',
          products: 'المنتجات',
          orders: 'الطلبات',
          customers: 'العملاء',
          analytics: 'التحليلات',
          settings: 'الإعدادات',
          profile: 'الملف الشخصي',
          logout: 'تسجيل خروج',
          // Add more translations
        },
      },
      he: {
        translation: {
          dashboard: 'לוח בקרה',
          products: 'מוצרים',
          orders: 'הזמנות',
          customers: 'לקוחות',
          analytics: 'ניתוח נתונים',
          settings: 'הגדרות',
          profile: 'פרופיל',
          logout: 'התנתק',
          // Add more translations
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const RTL_LANGUAGES = ['ar', 'he'];

const LanguageProvider = ({ children }) => {
  const { settings, updateSettings } = useStore();
  const isRtl = RTL_LANGUAGES.includes(settings.language);

  useEffect(() => {
    i18next.changeLanguage(settings.language);
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings.language, isRtl]);

  const theme = createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    // Your theme configuration
  });

  return (
    <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default LanguageProvider; 
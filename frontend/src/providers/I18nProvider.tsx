import React, { createContext, useContext, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

type Language = 'en' | 'es' | 'fr';

interface Translation {
  [key: string]: string;
}

interface Translations {
  [key: string]: Translation;
}

const translations: Translations = {
  en: {
    'app.title': 'Business Management Pro',
    'app.description': 'Manage your business efficiently',
    'auth.login': 'Sign in',
    'auth.register': 'Sign up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'settings.title': 'Settings',
    'settings.general': 'General Settings',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
    'settings.appearance': 'Appearance',
  },
  es: {
    'app.title': 'Gestión Empresarial Pro',
    'app.description': 'Gestiona tu negocio de manera eficiente',
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar contraseña',
    'auth.name': 'Nombre completo',
    'auth.rememberMe': 'Recordarme',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.haveAccount': '¿Ya tienes una cuenta?',
    'dashboard.title': 'Panel de control',
    'dashboard.welcome': 'Bienvenido de nuevo',
    'profile.title': 'Perfil',
    'profile.edit': 'Editar perfil',
    'settings.title': 'Configuración',
    'settings.general': 'Configuración general',
    'settings.notifications': 'Notificaciones',
    'settings.security': 'Seguridad',
    'settings.appearance': 'Apariencia',
  },
  fr: {
    'app.title': 'Gestion d\'Entreprise Pro',
    'app.description': 'Gérez votre entreprise efficacement',
    'auth.login': 'Se connecter',
    'auth.register': 'S\'inscrire',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.name': 'Nom complet',
    'auth.rememberMe': 'Se souvenir de moi',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.noAccount': 'Vous n\'avez pas de compte?',
    'auth.haveAccount': 'Vous avez déjà un compte?',
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue',
    'profile.title': 'Profil',
    'profile.edit': 'Modifier le profil',
    'settings.title': 'Paramètres',
    'settings.general': 'Paramètres généraux',
    'settings.notifications': 'Notifications',
    'settings.security': 'Sécurité',
    'settings.appearance': 'Apparence',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        // Add your English translations here
      },
    },
    es: {
      translation: {
        // Add your Spanish translations here
      },
    },
    fr: {
      translation: {
        // Add your French translations here
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'en';
  });

  const t = (key: string): string => {
    return i18n.t(key);
  };

  const value = {
    language,
    setLanguage: (newLanguage: Language) => {
      localStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
    },
    t,
  };

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}; 
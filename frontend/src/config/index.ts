interface Config {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiryKey: string;
    userInfoKey: string;
  };
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableOfflineMode: boolean;
  };
  ui: {
    theme: 'light' | 'dark';
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  business: {
    currency: string;
    taxRate: number;
    defaultPageSize: number;
  };
}

const config: Config = {
  api: {
    baseUrl: 'http://localhost:8000/api',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiryKey: 'token_expiry',
    userInfoKey: 'user_info'
  },
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableOfflineMode: false
  },
  ui: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm'
  },
  business: {
    currency: 'USD',
    taxRate: 0.1,
    defaultPageSize: 10
  }
};

export default config; 
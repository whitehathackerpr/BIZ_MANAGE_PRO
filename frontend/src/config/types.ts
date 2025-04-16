export interface Config {
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
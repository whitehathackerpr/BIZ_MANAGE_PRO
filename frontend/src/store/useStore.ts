import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, userService } from '../services';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// User interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  cryptoWallet?: {
    address: string;
    network: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string | File;
}

export interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SettingsData {
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme?: 'light' | 'dark';
  display_currency?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  sales: any | null;
  inventory: any | null;
  customers: any | null;
}

export interface Settings {
  language: string;
  timezone: string;
  notifications: boolean;
}

// Store state interface
export interface StoreState {
  // Auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Theme state
  themeMode: 'light' | 'dark';
  language: string;

  // Notifications state
  notifications: Notification[];
  
  // Analytics state
  analytics: AnalyticsData;
  
  // Settings state
  settings: Settings;
  
  // WebSocket connection
  socket: WebSocket | null;

  // Actions
  toggleTheme: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: number) => void;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: ProfileData) => Promise<boolean>;
  changePassword: (passwordData: PasswordData) => Promise<boolean>;
  updateSettings: (settingsData: SettingsData) => Promise<boolean>;
  setLanguage: (language: string) => void;
  setToken: (token: string) => void;
  setSocket: (socket: WebSocket) => void;
  connectSocket: () => void;
  setAnalytics: (type: keyof AnalyticsData, data: any) => void;
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Theme state
      themeMode: 'light',
      language: 'en',
      toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),

      // Notifications state
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id: Date.now() }],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      // Auth actions
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(credentials);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { user } = await authService.register(userData);
          
          set({
            user,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      // User actions
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const user = await userService.updateProfile(profileData);
          set({
            user,
            isLoading: false
          });
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      changePassword: async (passwordData) => {
        set({ isLoading: true });
        try {
          await authService.changePassword(passwordData);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Settings actions
      updateSettings: async (settingsData) => {
        set({ isLoading: true });
        try {
          await userService.updateSettings(settingsData);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Language actions
      setLanguage: (language) => {
        set({ language });
      },

      // Token management
      setToken: (token) => {
        set({ token });
      },

      // WebSocket connection
      socket: null,
      setSocket: (socket) => set({ socket }),
      connectSocket: () => {
        const socket = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws');
        socket.onopen = () => {
          console.log('WebSocket connected');
        };
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            get().addNotification(data.notification);
          }
        };
        set({ socket });
      },

      // Analytics state
      analytics: {
        sales: null,
        inventory: null,
        customers: null,
      },
      setAnalytics: (type, data) =>
        set((state) => ({
          analytics: { ...state.analytics, [type]: data },
        })),

      // Settings state
      settings: {
        language: 'en',
        timezone: 'UTC',
        notifications: true,
      },
    }),
    {
      name: 'biz-manage-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        themeMode: state.themeMode,
        language: state.language,
      }),
    }
  )
);

export default useStore; 
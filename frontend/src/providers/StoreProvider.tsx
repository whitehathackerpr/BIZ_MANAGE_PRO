import React, { createContext, useContext, useReducer } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: string;
}

interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr';
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'es' | 'fr' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const initialState: AppState = {
  user: null,
  theme: 'system',
  language: 'en',
  notifications: [],
  isLoading: false,
  error: null,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}; 
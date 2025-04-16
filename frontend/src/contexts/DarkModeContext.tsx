import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Define custom type for import.meta.env
interface ImportMetaEnv {
  VITE_ENABLE_DARK_MODE?: string;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

interface DarkModeProviderProps {
  children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  // Check if dark mode is enabled in localStorage or via environment variable
  const isDarkModeEnabled = 
    (import.meta.env as ImportMetaEnv).VITE_ENABLE_DARK_MODE === 'true' || 
    localStorage.getItem('darkMode') === 'true';

  const [isDarkMode, setIsDarkMode] = useState<boolean>(isDarkModeEnabled);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = (): DarkModeContextType => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export default DarkModeContext; 
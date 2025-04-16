import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button 
      className={`dark-mode-toggle ${isDarkMode ? 'active' : ''}`}
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9 9.03 9.03 0 0 0-9-9zm0 16a7 7 0 1 1 7-7 7 7 0 0 1-7 7zm0-14a1 1 0 0 0 1-1V2a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm0 14a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1zm9-9h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2zM5 12a1 1 0 0 0-1-1H2a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1zm.64-4.95a1 1 0 0 0 .71-.29l1.42-1.42a1 1 0 0 0-1.42-1.42L5 5.34a1 1 0 0 0 0 1.42 1 1 0 0 0 .71.29zm-.71 8.48a1 1 0 0 0 1.42 1.42l1.42-1.42a1 1 0 0 0-1.42-1.42l-1.42 1.42zm11.31-8.48a1 1 0 0 0 .71-.29 1 1 0 0 0 0-1.42l-1.42-1.42a1 1 0 0 0-1.42 1.42l1.42 1.42a1 1 0 0 0 .71.29zm-1.42 8.48l1.42 1.42a1 1 0 0 0 1.42-1.42l-1.42-1.42a1 1 0 0 0-1.42 1.42z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12.3 22h-.1a10.31 10.31 0 0 1-7.34-3.15 10.46 10.46 0 0 1-.26-14 10.13 10.13 0 0 1 4-2.74 1 1 0 0 1 1.06.22 1 1 0 0 1 .24 1 8.4 8.4 0 0 0 1.94 8.81 8.47 8.47 0 0 0 8.83 1.94 1 1 0 0 1 1.27 1.29A10.16 10.16 0 0 1 19.6 19a10.28 10.28 0 0 1-7.3 3z"/>
        </svg>
      )}
    </button>
  );
};

export default DarkModeToggle; 
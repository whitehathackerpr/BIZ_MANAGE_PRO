import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { I18nProvider } from './providers/I18nProvider';
import { StoreProvider } from './providers/StoreProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <ThemeProvider>
            <I18nProvider>
              <App />
            </I18nProvider>
          </ThemeProvider>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
); 
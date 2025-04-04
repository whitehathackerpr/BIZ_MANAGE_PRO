import React, { createContext, useContext, useState } from 'react';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

interface RtlContextType {
  isRtl: boolean;
  toggleRtl: () => void;
}

const RtlContext = createContext<RtlContextType | undefined>(undefined);

interface RtlProviderProps {
  children: React.ReactNode;
}

export const RtlProvider: React.FC<RtlProviderProps> = ({ children }) => {
  const [isRtl, setIsRtl] = useState(false);

  const toggleRtl = () => {
    setIsRtl(!isRtl);
    document.documentElement.dir = !isRtl ? 'rtl' : 'ltr';
  };

  return (
    <RtlContext.Provider value={{ isRtl, toggleRtl }}>
      <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
        {children}
      </CacheProvider>
    </RtlContext.Provider>
  );
};

export const useRtl = (): RtlContextType => {
  const context = useContext(RtlContext);
  if (context === undefined) {
    throw new Error('useRtl must be used within an RtlProvider');
  }
  return context;
};

export default RtlContext; 
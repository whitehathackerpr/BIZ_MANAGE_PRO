import React from 'react';
import React from 'react';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { useTheme } from '@mui/material/styles';

// Create rtl cache
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
    key: 'muiltr',
});

export function RtlProvider: React.FC({ children }) {
    const theme = useTheme();
    const isRtl = theme.direction === 'rtl';

    return (
        <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
            {children}
        </CacheProvider>
    );
} 
import React from 'react';
import { Box, CssBaseline, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Header open={open} toggleDrawer={toggleDrawer} />
            <Sidebar open={open} toggleDrawer={toggleDrawer} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${240}px)` },
                    ml: { sm: `${240}px` },
                    mt: '64px',
                    backgroundColor: theme.palette.background.default,
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout; 
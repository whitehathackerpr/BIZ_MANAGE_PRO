import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00F5FF',
      light: '#6EFFFF',
      dark: '#00C2D4',
    },
    secondary: {
      main: '#FF2E63',
      light: '#FF6B8B',
      dark: '#C4003D',
    },
    background: {
      default: '#0A0B1E',
      paper: '#131428',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 24px',
          background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
          },
        },
        outlined: {
          background: 'transparent',
          border: '2px solid #00F5FF',
          color: '#00F5FF',
          '&:hover': {
            background: 'rgba(0, 245, 255, 0.1)',
            border: '2px solid #00F5FF',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'rgba(19, 20, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'rgba(19, 20, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.05)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00F5FF',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(19, 20, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(19, 20, 40, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
          '&.Mui-selected': {
            background: 'rgba(0, 245, 255, 0.1)',
            '&:hover': {
              background: 'rgba(0, 245, 255, 0.15)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.05)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
  },
});

export default theme; 
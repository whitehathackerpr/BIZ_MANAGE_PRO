import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, TextField, Button, Link } from '@mui/material';

// Color palette
const colors = {
  primary: '#0066CC', // Main blue
  secondary: '#4A90E2', // Light blue
  background: {
    light: '#FFFFFF',
    dark: '#0066CC',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#FFFFFF',
  },
};

export const Container = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#F5F5F5',
  padding: '16px',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '"Inter", sans-serif',
});

export const StyledPaper = styled(Paper)({
  display: 'flex',
  flexDirection: 'row',
  background: colors.background.light,
  borderRadius: '24px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  maxWidth: '1000px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    maxWidth: '400px',
  },
});

export const WelcomeSection = styled(Box)({
  flex: '1',
  background: colors.primary,
  padding: '48px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  color: colors.text.light,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
  },
  '@media (max-width: 768px)': {
    padding: '32px',
  },
});

export const FormSection = styled(Box)({
  flex: '1',
  padding: '48px',
  display: 'flex',
  flexDirection: 'column',
  background: colors.background.light,
  '@media (max-width: 768px)': {
    padding: '32px',
  },
});

export const WelcomeTitle = styled(Typography)({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: '16px',
  color: colors.text.light,
});

export const WelcomeText = styled(Typography)({
  fontSize: '1rem',
  lineHeight: 1.6,
  opacity: 0.9,
  marginBottom: '24px',
});

export const Title = styled(Typography)({
  color: colors.text.primary,
  marginBottom: '8px',
  fontWeight: 600,
  fontSize: '1.75rem',
});

export const Subtitle = styled(Typography)({
  color: colors.text.secondary,
  marginBottom: '32px',
  fontSize: '0.875rem',
});

export const Form = styled('form')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: colors.background.light,
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: colors.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
    },
    '& input': {
      padding: '12px 16px',
      fontSize: '0.875rem',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: colors.text.secondary,
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
});

export const SubmitButton = styled(Button)({
  marginTop: '16px',
  background: colors.primary,
  color: colors.text.light,
  padding: '12px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  '&:hover': {
    background: colors.secondary,
  },
});

export const StyledLink = styled(Link)({
  color: colors.primary,
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
});

export const FormFooter = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
});

export const CheckboxLabel = styled(Typography)({
  fontSize: '0.875rem',
  color: colors.text.secondary,
});

export const SignUpPrompt = styled(Box)({
  marginTop: '24px',
  textAlign: 'center',
  '& > span': {
    fontSize: '0.875rem',
    color: colors.text.secondary,
  },
});

export const ErrorMessage = styled(Typography)({
  color: '#e53935',
  marginBottom: '16px',
  textAlign: 'center',
  background: 'rgba(229, 57, 53, 0.1)',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: '1px solid rgba(229, 57, 53, 0.2)',
});

export const SuccessMessage = styled(Typography)({
  color: '#43a047',
  marginBottom: '16px',
  textAlign: 'center',
  background: 'rgba(67, 160, 71, 0.1)',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: '1px solid rgba(67, 160, 71, 0.2)',
});

export const LoadingOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
});

export const AnimatedBackground = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  background: colors.primary,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
}); 
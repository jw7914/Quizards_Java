import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#6d28d9',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff'
    },
    background: {
      default: '#09090b',
      paper: '#18181b',
    },
    text: { primary: '#f4f4f5', secondary: '#a1a1aa' },
    divider: 'rgba(255, 255, 255, 0.08)'
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)' }
        },
        containedPrimary: { boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)', '&:hover': { boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)' } },
        containedSecondary: { boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)', '&:hover': { boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)' } }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: 'rgba(24, 24, 27, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)' }
      }
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            transition: 'all 0.2s ease',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' } },
            '&.Mui-focused': { backgroundColor: 'rgba(0, 0, 0, 0.2)' }
          }
        }
      }
    }
  }
});

export default theme;

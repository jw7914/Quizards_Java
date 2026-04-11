import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      light: '#8ab4f8',
      dark: '#174ea6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ea4335',
      light: '#f28b82',
      dark: '#c5221f',
      contrastText: '#ffffff',
    },
    success: {
      main: '#34a853',
    },
    warning: {
      main: '#fbbc04',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368',
    },
    divider: '#dadce0',
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", "Roboto", sans-serif',
      fontSize: 'clamp(2.5rem, 6vw, 4rem)',
      fontWeight: 500,
      letterSpacing: '-0.02em',
      color: '#202124',
    },
    h2: {
      fontWeight: 400,
      color: '#202124',
    },
    h4: {
      fontWeight: 400,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.2px',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid #dadce0',
          boxShadow: 'none',
          transition: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(32,33,36,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#5f6368',
          borderBottom: '1px solid #dadce0',
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: '1px solid #dadce0',
          boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14)',
        },
      },
    },
  },
})

export default theme

import { createTheme } from '@mui/material/styles';

export const alchemicalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4AF37', // Or noble mat
      light: '#E6C665',
      dark: '#AA8822',
      contrastText: '#08090C',
    },
    secondary: {
      main: '#10B981', // Émeraude discret
      light: '#34D399',
      dark: '#059669',
      contrastText: '#041810',
    },
    info: {
      main: '#38BDF8',
      light: '#7DD3FC',
      dark: '#0284C7',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#F43F5E',
    },
    background: {
      default: '#08090D', // Ardoise noire très sombre
      paper: '#0F1118',   // Surface carte très épurée
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
    },
    divider: 'rgba(255, 255, 255, 0.06)',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 8, // Arrondis modernes & épurés
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#08090D',
          color: '#F1F5F9',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0F1118',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 14px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: '#D4AF37',
          color: '#08090C',
          '&:hover': {
            background: '#E6C665',
          },
        },
        containedSecondary: {
          background: '#10B981',
          color: '#041810',
          '&:hover': {
            background: '#34D399',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(212, 175, 55, 0.3)',
          color: '#E6C665',
          '&:hover': {
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 10,
          background: '#0F1118',
        },
      },
    },
  },
});

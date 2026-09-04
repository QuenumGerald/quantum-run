import { createTheme } from '@mui/material/styles';

// Palette officielle inspirée du Design System d'OpenAI (ChatGPT & Canvas UI)
export const alchemicalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10A37F', // Vert Émeraude Signature OpenAI
      light: '#1ADA9D',
      dark: '#0B7A5F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D4AF37', // Or Alchimique pour la progression et l'XP
      light: '#E6C665',
      dark: '#AA8822',
      contrastText: '#0D0D0D',
    },
    info: {
      main: '#38BDF8', // Cyan ChatGPT Apps
      light: '#7DD3FC',
      dark: '#0284C7',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    background: {
      default: '#0D0D0D', // Fond ChatGPT ultra-épuré
      paper: '#171717',   // Cartes & Surfaces OpenAI
    },
    text: {
      primary: '#ECECEC',   // Texte principal OpenAI
      secondary: '#B4B4B4', // Texte secondaire OpenAI
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
    borderRadius: 8, // Standard OpenAI Apps SDK
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0D0D0D',
          color: '#ECECEC',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#171717',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#171717',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '6px 14px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: '#10A37F',
          color: '#FFFFFF',
          '&:hover': {
            background: '#1ADA9D',
          },
        },
        containedSecondary: {
          background: '#D4AF37',
          color: '#0D0D0D',
          '&:hover': {
            background: '#E6C665',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(16, 163, 127, 0.4)',
          color: '#10A37F',
          '&:hover': {
            borderColor: '#10A37F',
            backgroundColor: 'rgba(16, 163, 127, 0.08)',
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
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 10,
          background: '#171717',
        },
      },
    },
  },
});

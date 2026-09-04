import { createTheme } from '@mui/material/styles';

// Thème officiel Cyber-Alchimique Opus Magnum (Or Alchimique, Émeraude Hermétique & Athanor)
export const alchemicalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F59E0B', // Or Alchimique Doré (Grand Œuvre)
      light: '#FBBF24',
      dark: '#B45309',
      contrastText: '#05070A',
    },
    secondary: {
      main: '#10B981', // Vert Émeraude Hermétique (Table d'Émeraude)
      light: '#34D399',
      dark: '#059669',
      contrastText: '#05070A',
    },
    info: {
      main: '#A855F7', // Violet Améthyste Mystique (Saga des Arcanes)
      light: '#C084FC',
      dark: '#7E22CE',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    background: {
      default: '#05070A', // Void Alchimique Stellaire
      paper: '#0C101A',   // Surfaces & Creuset de l'Athanor
    },
    text: {
      primary: '#F8FAFC',   // Parchemin Céleste
      secondary: '#94A3B8', // Argent Lunaire
    },
    divider: 'rgba(245, 158, 11, 0.16)',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontFamily: "'Cinzel', serif", fontWeight: 900, letterSpacing: '0.04em' },
    h2: { fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: '0.03em' },
    h3: { fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: '0.02em' },
    h4: { fontFamily: "'Cinzel', serif", fontWeight: 700 },
    h5: { fontFamily: "'Cinzel', serif", fontWeight: 700 },
    h6: { fontFamily: "'Cinzel', serif", fontWeight: 700 },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.04em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#05070A',
          color: '#F8FAFC',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0C101A',
          border: '1px solid rgba(245, 158, 11, 0.16)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(9, 13, 20, 0.92)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
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
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: '#05070A',
          fontWeight: 700,
          boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.5)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          fontWeight: 700,
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.5)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(245, 158, 11, 0.4)',
          color: '#FBBF24',
          '&:hover': {
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(245, 158, 11, 0.16)',
          borderRadius: 12,
          background: 'linear-gradient(160deg, #0F1523 0%, #090E17 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      },
    },
  },
});

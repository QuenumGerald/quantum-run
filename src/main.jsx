import './main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppsSDKUIProvider } from '@openai/apps-sdk-ui/components/AppsSDKUIProvider';
import { alchemicalTheme } from './theme';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppsSDKUIProvider>
      <ThemeProvider theme={alchemicalTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </AppsSDKUIProvider>
  </React.StrictMode>
);

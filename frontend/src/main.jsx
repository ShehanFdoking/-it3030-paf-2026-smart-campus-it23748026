import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import NotificationsShell from './notification/NotificationsShell';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const mountNode = document.createElement('div');
document.body.prepend(mountNode);

ReactDOM.createRoot(mountNode).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
      <NotificationsShell />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

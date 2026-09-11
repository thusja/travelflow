import React from 'react';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { installAuthFetchInterceptor } from '@/utils/httpClient.js';
import AppQueryProvider from '@/app/QueryProvider.jsx';

installAuthFetchInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppQueryProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppQueryProvider>
  </React.StrictMode>
)

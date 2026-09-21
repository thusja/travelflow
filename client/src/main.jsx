import React from 'react';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { installAuthFetchInterceptor } from '@/utils/httpClient.js';
import AppQueryProvider from '@/app/QueryProvider.jsx';
import { ToastProvider } from '@/components/Common/ToastProvider.jsx';

installAuthFetchInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AppQueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppQueryProvider>
    </ToastProvider>
  </React.StrictMode>
)

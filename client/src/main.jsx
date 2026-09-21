import React from 'react';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { installAuthFetchInterceptor } from '@/utils/httpClient.js';
import AppQueryProvider from '@/app/QueryProvider.jsx';
import { ToastProvider } from '@/components/Common/ToastProvider.jsx';
import { ConfirmProvider } from '@/components/Common/ConfirmProvider.jsx';

installAuthFetchInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <AppQueryProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppQueryProvider>
      </ConfirmProvider>
    </ToastProvider>
  </React.StrictMode>
)

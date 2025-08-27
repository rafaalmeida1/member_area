import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { NotificationDrawerProvider } from './contexts/NotificationDrawerContext'
import { Toaster } from './components/ui/toaster'
import App from './App.tsx'
import './index.css'

const { createRoot } = ReactDOM;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <NotificationDrawerProvider>
            <App />
            <Toaster />
          </NotificationDrawerProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { Toaster } from './components/ui/toaster'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

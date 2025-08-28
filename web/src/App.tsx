import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ThemeLoadingScreen } from './components/ThemeLoadingScreen';
import AppRoutes from './AppRoutes';
import './App.css';

function AppContent() {
  const { isLoading } = useTheme();

  return (
    <>
      <ThemeLoadingScreen isLoading={isLoading} />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useNotificationDrawer } from './contexts/NotificationDrawerContext';
import { AllNotificationsModal } from './components/AllNotificationsModal';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { InviteToken } from './pages/InviteToken';
import { InviteRegister } from './pages/InviteRegister';
import Index from './pages/Index';
import { PatientHome } from './pages/PatientHome';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { MyAccount } from './pages/MyAccount';
import { InviteManagement } from './pages/InviteManagement';
import { PatientManagement } from './pages/PatientManagement';
import { ProfessionalSettings } from './pages/ProfessionalSettings';
import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ModuleViewer } from './components/ModuleViewer';
import './App.css';

// Componente para proteger rotas que precisam de autenticação
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verificando autenticação..." overlay card size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Componente para redirecionar usuários autenticados das páginas de auth
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Verificando autenticação..." overlay card size="lg" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { isModalOpen, closeModal, onNavigateToModule } = useNotificationDrawer();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
        <Route path="/reset-password" element={user ? <Navigate to="/" /> : <ResetPassword />} />
        <Route path="/invite/:token" element={user ? <Navigate to="/" /> : <InviteToken />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <InviteRegister />} />

        {/* Rotas protegidas */}
        <Route path="/" element={user ? <Index /> : <Navigate to="/login" />} />
        <Route path="/patient" element={user ? <PatientHome /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/my-account" element={user ? <MyAccount /> : <Navigate to="/login" />} />
        <Route path="/invites" element={user ? <InviteManagement /> : <Navigate to="/login" />} />
        <Route path="/patients" element={user ? <PatientManagement /> : <Navigate to="/login" />} />
        <Route path="/professional-settings" element={user ? <ProfessionalSettings /> : <Navigate to="/login" />} />
        <Route path="/module/:id" element={user ? <ModuleViewer /> : <Navigate to="/login" />} />
        
        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Modal de notificações renderizado no nível mais alto */}
      <AllNotificationsModal />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppContent />
    </div>
  );
}

export default App;
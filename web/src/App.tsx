import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useNotificationDrawer } from './contexts/NotificationDrawerContext';
import { AllNotificationsDrawer } from './components/AllNotificationsDrawer';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { InviteRegister } from './pages/InviteRegister';
import { InviteToken } from './pages/InviteToken';
import { ProfessionalSettings } from './pages/ProfessionalSettings';
import { AdminDashboard } from './pages/AdminDashboard';
import { PatientManagement } from './pages/PatientManagement';
import { InviteManagement } from './pages/InviteManagement';
import { Settings } from './pages/Settings';
import { MyAccount } from './pages/MyAccount';
import { PatientHome } from './pages/PatientHome';
import { ModuleViewer } from './components/ModuleViewer';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components/LoadingSpinner';
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

function App() {
  const { isDrawerOpen, closeDrawer, onNavigateToModule } = useNotificationDrawer();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Rotas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password/:token" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />
        
        {/* Rotas para convites (podem ser acessadas sem autenticação) */}
        <Route 
          path="/invite" 
          element={
            <PublicRoute>
              <InviteToken />
            </PublicRoute>
          } 
        />
        <Route path="/invite/:token" element={<InviteRegister />} />
        
        {/* Rotas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas para profissionais */}
        <Route 
          path="/modules" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/invites" 
          element={
            <ProtectedRoute>
              <InviteManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/patients" 
          element={
            <ProtectedRoute>
              <PatientManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/professional-settings" 
          element={
            <ProtectedRoute>
              <ProfessionalSettings />
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas para todos os usuários */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota para visualizar módulo específico */}
        <Route 
          path="/module/:id" 
          element={
            <ProtectedRoute>
              <ModuleViewer />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota catch-all para páginas não encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Drawer de notificações renderizado no nível mais alto */}
      <AllNotificationsDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onNavigateToModule={onNavigateToModule}
      />
    </div>
  );
}

export default App;
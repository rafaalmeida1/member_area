import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { InviteToken } from './pages/InviteToken';
import { InviteRegister } from './pages/InviteRegister';
import Index from './pages/Index';
import { PatientHome } from './pages/PatientHome';
import { AdminDashboard } from './pages/AdminDashboard';
import { Settings } from './pages/Settings';
import { MyAccount } from './pages/MyAccount';
import { InviteManagement } from './pages/InviteManagement';
import { PatientManagement } from './pages/PatientManagement';
import { ProfessionalSettings } from './pages/ProfessionalSettings';
import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ModuleViewer } from './components/ModuleViewer';

// Componente para rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

// Componente para rotas públicas
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
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
    </div>
  );
}

export default AppRoutes; 
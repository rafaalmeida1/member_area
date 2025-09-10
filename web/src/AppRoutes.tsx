import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { InviteToken } from './pages/InviteToken';
import { InviteRegister } from './pages/InviteRegister';
// import Index from './pages/Index';
import { PatientHome } from './pages/PatientHome';
import { ModuleManagement } from './pages/ModuleManagement';
import { MyAccount } from './pages/MyAccount';
import { InviteManagement } from './pages/InviteManagement';
import { PatientManagement } from './pages/PatientManagement';
import { ProfessionalSettings } from './pages/ProfessionalSettings';
import { CacheManagement } from './pages/CacheManagement';
import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ModuleViewer } from './components/ModuleViewer';
import PublicLinks from './pages/PublicLinks';
import MyLinks from './pages/MyLinks';
import LinkAnalytics from './pages/LinkAnalytics';

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
        
        {/* Rota pública para links do profissional */}
        <Route path="/links/:professionalId" element={<PublicLinks />} />
        
        {/* Rotas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PatientHome />
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas para profissionais */}
        <Route 
          path="/modules" 
          element={
            <ProtectedRoute>
              <ModuleManagement />
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
        
        <Route 
          path="/my-links" 
          element={
            <ProtectedRoute>
              <MyLinks />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <LinkAnalytics />
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
          path="/my-account" 
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cache-management" 
          element={
            <ProtectedRoute>
              <CacheManagement />
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
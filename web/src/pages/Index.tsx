import { useAuth } from '@/contexts/AuthContext';
import { ModernLayout } from '@/components/ModernLayout';
import { DashboardStats } from '@/components/DashboardStats';
import { Login } from './Login';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  // Se não estiver autenticado, mostrar login
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  return (
    <ModernLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Olá, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'PROFESSIONAL' 
              ? 'Aqui está um resumo da sua prática profissional hoje.'
              : 'Acompanhe seu progresso nutricional e continue sua jornada.'
            }
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats userRole={user.role} />
      </div>
    </ModernLayout>
  );
};

export default Index;

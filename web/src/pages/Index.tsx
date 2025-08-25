import { useAuth } from '@/contexts/AuthContext';
import { PatientHome } from './PatientHome';
import { Login } from './Login';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  // Se não estiver autenticado, mostrar login
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Renderizar home do paciente (padrão)
  return (
    <PatientHome
      professionalName={user.role === 'PROFESSIONAL' ? user.name : undefined}
    />
  );
};

export default Index;

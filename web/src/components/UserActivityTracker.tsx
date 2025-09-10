import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userActivityService } from '@/services/userActivityService';

export function UserActivityTracker() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Inicializar sessão quando o usuário fizer login
    if (user && !userActivityService.hasActiveSession()) {
      userActivityService.startSession();
    }

    // Finalizar sessão quando o usuário fizer logout
    if (!user && userActivityService.hasActiveSession()) {
      userActivityService.endSession();
    }
  }, [user]);

  useEffect(() => {
    // Só rastrear se o usuário estiver logado e tiver uma sessão ativa
    if (user && userActivityService.hasActiveSession()) {
      const currentPath = location.pathname + location.search;
      userActivityService.trackPageView(currentPath);
    }
  }, [location, user]);

  // Finalizar sessão quando a página for fechada
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        userActivityService.endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  return null; // Este componente não renderiza nada
}

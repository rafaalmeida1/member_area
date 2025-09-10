import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { userActivityService } from '@/services/userActivityService';

export const useUserActivity = () => {
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());

  // Rastrear mudanças de página
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    userActivityService.trackPageView(currentPath);
    pageStartTime.current = Date.now();
  }, [location]);

  // Rastrear tempo gasto na página quando o componente for desmontado
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - pageStartTime.current) / 1000);
      if (timeSpent > 0 && location.pathname) {
        // Aqui você pode implementar lógica adicional se necessário
        console.log(`Tempo gasto em ${location.pathname}: ${timeSpent} segundos`);
      }
    };
  }, [location.pathname]);

  // Inicializar sessão quando o hook for usado
  useEffect(() => {
    if (!userActivityService.hasActiveSession()) {
      userActivityService.startSession();
    }

    // Finalizar sessão quando a página for fechada
    const handleBeforeUnload = () => {
      userActivityService.endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    trackModuleView: userActivityService.trackModuleView.bind(userActivityService),
    trackModuleCompletion: userActivityService.trackModuleCompletion.bind(userActivityService),
    getCurrentSessionId: userActivityService.getCurrentSessionId.bind(userActivityService),
    hasActiveSession: userActivityService.hasActiveSession.bind(userActivityService)
  };
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeColors } from '@/services/api';

interface ThemeContextType {
  theme: ThemeColors;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
  markForAnimation: () => void;
}

const defaultTheme: ThemeColors = {
  primaryColor: '#DBCFCB',
  secondaryColor: '#D8C4A4',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#FAFAFA',
  textPrimaryColor: '#2C2C2C',
  textSecondaryColor: '#666666',
  borderColor: '#E0E0E0',
  hoverColor: '#F0F0F0',
  disabledColor: '#CCCCCC'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);

  const applyThemeToCSS = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    
    // Aplicar cores personalizadas como CSS custom properties
    root.style.setProperty('--color-primary', themeColors.primaryColor);
    root.style.setProperty('--color-secondary', themeColors.secondaryColor);
    root.style.setProperty('--color-background', themeColors.backgroundColor);
    root.style.setProperty('--color-surface', themeColors.surfaceColor);
    root.style.setProperty('--color-text-primary', themeColors.textPrimaryColor);
    root.style.setProperty('--color-text-secondary', themeColors.textSecondaryColor);
    root.style.setProperty('--color-border', themeColors.borderColor);
    root.style.setProperty('--color-hover', themeColors.hoverColor);
    root.style.setProperty('--color-disabled', themeColors.disabledColor);
    
    // Aplicar também para compatibilidade com Tailwind
    root.style.setProperty('--tw-color-primary', themeColors.primaryColor);
    root.style.setProperty('--tw-color-secondary', themeColors.secondaryColor);
    root.style.setProperty('--tw-color-background', themeColors.backgroundColor);
    root.style.setProperty('--tw-color-surface', themeColors.surfaceColor);
    root.style.setProperty('--tw-color-text-primary', themeColors.textPrimaryColor);
    root.style.setProperty('--tw-color-text-secondary', themeColors.textSecondaryColor);
    root.style.setProperty('--tw-color-border', themeColors.borderColor);
    root.style.setProperty('--tw-color-hover', themeColors.hoverColor);
    root.style.setProperty('--tw-color-disabled', themeColors.disabledColor);
    
    // Forçar re-render de todos os elementos
    document.body.style.setProperty('--color-primary', themeColors.primaryColor);
    document.body.style.setProperty('--color-secondary', themeColors.secondaryColor);
    document.body.style.setProperty('--color-background', themeColors.backgroundColor);
    document.body.style.setProperty('--color-surface', themeColors.surfaceColor);
    document.body.style.setProperty('--color-text-primary', themeColors.textPrimaryColor);
    document.body.style.setProperty('--color-text-secondary', themeColors.textSecondaryColor);
  };

  const saveThemeToLocalStorage = (themeColors: ThemeColors) => {
    try {
      localStorage.setItem('nutri-thata-theme', JSON.stringify(themeColors));
    } catch (error) {
      console.error('Erro ao salvar tema no localStorage:', error);
    }
  };

  const loadThemeFromLocalStorage = (): ThemeColors | null => {
    try {
      const saved = localStorage.getItem('nutri-thata-theme');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erro ao carregar tema do localStorage:', error);
      return null;
    }
  };

  const isExternalRedirect = (): boolean => {
    try {
      // Verificar se é um redirect externo (navegação direta ou refresh)
      const navigationType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type;
      
      // Se é 'navigate' (navegação direta) ou 'reload' (refresh), é externo
      if (navigationType === 'navigate' || navigationType === 'reload') {
        return true;
      }
      
      // Verificar se há referrer (se não há, é navegação direta)
      if (!document.referrer) {
        return true;
      }
      
      // Verificar se o referrer é do mesmo domínio
      const currentDomain = window.location.origin;
      const referrerDomain = new URL(document.referrer).origin;
      
      // Se o referrer é de domínio diferente, é redirect externo
      if (referrerDomain !== currentDomain) {
        return true;
      }
      
      // Se chegou até aqui, é navegação interna
      return false;
    } catch (error) {
      console.error('Erro ao detectar tipo de navegação:', error);
      return true; // Em caso de erro, assume que é externo
    }
  };

  const shouldShowAnimation = (): boolean => {
    try {
      // Não mostrar animação na página pública de links
      if (window.location.pathname.startsWith('/links/')) {
        return false;
      }
      
      // Verificar se foi marcado para mostrar animação (para redirects diretos)
      const shouldAnimate = sessionStorage.getItem('nutri-thata-show-animation');
      if (shouldAnimate === 'true') {
        sessionStorage.removeItem('nutri-thata-show-animation');
        return true;
      }
      
      // Se é redirect externo, mostrar animação
      return isExternalRedirect();
    } catch (error) {
      console.error('Erro ao verificar se deve mostrar animação:', error);
      return false;
    }
  };

  // Função para marcar que deve mostrar animação (usada em links de redirect direto)
  const markForAnimation = () => {
    try {
      sessionStorage.setItem('nutri-thata-show-animation', 'true');
    } catch (error) {
      console.error('Erro ao marcar para animação:', error);
    }
  };

  const loadTheme = async () => {
    try {
      // Verificar se deve mostrar animação
      const showAnimation = shouldShowAnimation();
      
      if (showAnimation) {
        // Mostrar animação apenas em redirects externos
        setIsLoading(true);
        
        // Simular um delay mínimo para mostrar a animação
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      // Tentar carregar do localStorage primeiro
      const savedTheme = loadThemeFromLocalStorage();
      
      if (savedTheme) {
        // Usar tema salvo
        setTheme(savedTheme);
        applyThemeToCSS(savedTheme);
        
        if (showAnimation) {
          // Delay adicional para garantir que a animação seja vista
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
        return;
      }

      // Se não há tema salvo, carregar do servidor
      const { apiService } = await import('@/services/api');
      const themeColors = await apiService.getTheme();
      
      setTheme(themeColors);
      applyThemeToCSS(themeColors);
      saveThemeToLocalStorage(themeColors);
      
      if (showAnimation) {
        // Delay adicional para garantir que a animação seja vista
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      // Usar tema padrão em caso de erro
      setTheme(defaultTheme);
      applyThemeToCSS(defaultTheme);
      
      if (shouldShowAnimation()) {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } else {
        setIsLoading(false);
      }
    }
  };

  const refreshTheme = async () => {
    try {
      const { apiService } = await import('@/services/api');
      const themeColors = await apiService.getTheme();
      
      setTheme(themeColors);
      applyThemeToCSS(themeColors);
      saveThemeToLocalStorage(themeColors);
    } catch (error) {
      console.error('Erro ao atualizar tema:', error);
    }
  };

  useEffect(() => {
    loadTheme();

    // Listener para detectar navegação interna e garantir que a animação não apareça
    const handleBeforeUnload = () => {
      // Não fazer nada aqui, deixar a lógica natural funcionar
    };

    // Listener para detectar quando a página é carregada via navegação interna
    const handlePageShow = (event: PageTransitionEvent) => {
      // Se a página foi carregada do cache (navegação interna), não mostrar animação
      if (event.persisted) {
        setIsLoading(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    applyThemeToCSS(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, refreshTheme, markForAnimation }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
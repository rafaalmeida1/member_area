import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { ThemeColors } from '@/services/api';

interface ThemeContextType {
  theme: ThemeColors;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
  markForAnimation: () => void;
  forceThemeUpdate: () => void;
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
    root.style.setProperty('--color-text', themeColors.textPrimaryColor); // Alias para compatibilidade
    root.style.setProperty('--color-border', themeColors.borderColor);
    root.style.setProperty('--color-hover', themeColors.hoverColor);
    root.style.setProperty('--color-disabled', themeColors.disabledColor);
    // Variáveis específicas de botão usadas pelos componentes UI
    // Mapeamento padrão: background -> primary, hover -> secondary, text -> texto primário
    root.style.setProperty('--color-button-background', themeColors.primaryColor);
    root.style.setProperty('--color-button-hover', themeColors.secondaryColor);
    root.style.setProperty('--color-button-text', themeColors.textPrimaryColor);
    
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
    document.body.style.setProperty('--color-text', themeColors.textPrimaryColor); // Alias para compatibilidade
    document.body.style.setProperty('--color-border', themeColors.borderColor);
    document.body.style.setProperty('--color-hover', themeColors.hoverColor);
    document.body.style.setProperty('--color-disabled', themeColors.disabledColor);
    // Variáveis de botão também no body
    document.body.style.setProperty('--color-button-background', themeColors.primaryColor);
    document.body.style.setProperty('--color-button-hover', themeColors.secondaryColor);
    document.body.style.setProperty('--color-button-text', themeColors.textPrimaryColor);
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


  // Função para marcar que deve mostrar animação (usada em links de redirect direto)
  const markForAnimation = () => {
    try {
      sessionStorage.setItem('nutri-thata-show-animation', 'true');
    } catch (error) {
      console.error('Erro ao marcar para animação:', error);
    }
  };

  const loadTheme = useCallback(async () => {
    try {
      // Verificar se deve mostrar animação
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
      
      const showAnimation = shouldShowAnimation();
      
      if (showAnimation) {
        // Mostrar animação apenas em redirects externos
        setIsLoading(true);
        
        // Simular um delay mínimo para mostrar a animação
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      // PRIMEIRO: Tentar carregar da API (sempre priorizar servidor)
      try {
        const { apiService } = await import('@/services/api');
        const serverTheme = await apiService.getTheme();
        
        setTheme(serverTheme);
        applyThemeToCSS(serverTheme);
        saveThemeToLocalStorage(serverTheme);
        console.log('Tema carregado da API');
        
        if (showAnimation) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          setIsLoading(false);
        }
        
        return; // Sair da função se conseguiu carregar da API
      } catch (serverError) {
        console.warn('Erro ao carregar tema da API, tentando localStorage:', serverError);
      }

      // SEGUNDO: Se falhou a API, tentar localStorage
      const savedTheme = loadThemeFromLocalStorage();
      
      if (savedTheme) {
        setTheme(savedTheme);
        applyThemeToCSS(savedTheme);
        console.log('Tema carregado do localStorage (fallback)');
        
        if (showAnimation) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          setIsLoading(false);
        }
      } else {
        // Último recurso: usar tema padrão
        setTheme(defaultTheme);
        applyThemeToCSS(defaultTheme);
        console.log('Tema padrão aplicado (sem localStorage)');
        
        if (showAnimation) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } else {
          setIsLoading(false);
        }
      }
      
    } catch (error) {
      console.error('Erro crítico ao carregar tema:', error);
      
      // Último recurso: usar tema padrão
      setTheme(defaultTheme);
      applyThemeToCSS(defaultTheme);
      console.log('Tema padrão aplicado (erro crítico)');
      
      setIsLoading(false);
    }
  }, []);

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

  const forceThemeUpdate = () => {
    const savedTheme = loadThemeFromLocalStorage();
    if (savedTheme) {
      setTheme(savedTheme);
      applyThemeToCSS(savedTheme);
    }
  };

  useEffect(() => {
    loadTheme();

    // Listener para detectar mudanças no localStorage do tema
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nutri-thata-theme' && e.newValue) {
        try {
          const newTheme = JSON.parse(e.newValue);
          setTheme(newTheme);
          applyThemeToCSS(newTheme);
        } catch (error) {
          console.error('Erro ao aplicar tema do localStorage:', error);
        }
      }
    };

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

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [loadTheme]);

  useEffect(() => {
    applyThemeToCSS(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, refreshTheme, markForAnimation, forceThemeUpdate }}>
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
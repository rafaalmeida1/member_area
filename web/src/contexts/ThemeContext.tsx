import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeColors } from '@/services/api';

interface ThemeContextType {
  theme: ThemeColors;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
}

const defaultTheme: ThemeColors = {
  primaryColor: '#DBCFCB',
  secondaryColor: '#D8C4A4',
  accentColor: '#A67B5B',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#FAFAFA',
  textColor: '#2C2C2C',
  textSecondaryColor: '#666666'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  const applyThemeToCSS = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    
    // Aplicar cores personalizadas como CSS custom properties
    root.style.setProperty('--color-primary', themeColors.primaryColor);
    root.style.setProperty('--color-secondary', themeColors.secondaryColor);
    root.style.setProperty('--color-accent', themeColors.accentColor);
    root.style.setProperty('--color-background', themeColors.backgroundColor);
    root.style.setProperty('--color-surface', themeColors.surfaceColor);
    root.style.setProperty('--color-text', themeColors.textColor);
    root.style.setProperty('--color-text-secondary', themeColors.textSecondaryColor);
    
    // Definir cores derivadas
    root.style.setProperty('--color-border', themeColors.backgroundColor === '#FFFFFF' ? '#e5e5e5' : '#333333');
    root.style.setProperty('--color-muted', themeColors.backgroundColor === '#FFFFFF' ? '#f5f5f5' : '#2c2c2c');
    root.style.setProperty('--color-shadow', themeColors.backgroundColor === '#FFFFFF' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.5)');
    root.style.setProperty('--color-overlay', themeColors.backgroundColor === '#FFFFFF' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.8)');
    
    // Aplicar também para compatibilidade com Tailwind
    root.style.setProperty('--tw-color-primary', themeColors.primaryColor);
    root.style.setProperty('--tw-color-secondary', themeColors.secondaryColor);
    root.style.setProperty('--tw-color-accent', themeColors.accentColor);
    root.style.setProperty('--tw-color-background', themeColors.backgroundColor);
    root.style.setProperty('--tw-color-surface', themeColors.surfaceColor);
    root.style.setProperty('--tw-color-text', themeColors.textColor);
    root.style.setProperty('--tw-color-text-secondary', themeColors.textSecondaryColor);
    root.style.setProperty('--tw-color-border', themeColors.backgroundColor === '#FFFFFF' ? '#e5e5e5' : '#333333');
    root.style.setProperty('--tw-color-muted', themeColors.backgroundColor === '#FFFFFF' ? '#f5f5f5' : '#2c2c2c');
    
    // Forçar re-render de todos os elementos
    document.body.style.setProperty('--color-primary', themeColors.primaryColor);
    document.body.style.setProperty('--color-secondary', themeColors.secondaryColor);
    document.body.style.setProperty('--color-accent', themeColors.accentColor);
    document.body.style.setProperty('--color-background', themeColors.backgroundColor);
    document.body.style.setProperty('--color-surface', themeColors.surfaceColor);
    document.body.style.setProperty('--color-text', themeColors.textColor);
    document.body.style.setProperty('--color-text-secondary', themeColors.textSecondaryColor);
  };

  const loadTheme = async () => {
    try {
      setIsLoading(true);
      
      // Simular um delay mínimo para mostrar a animação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { apiService } = await import('@/services/api');
      const themeColors = await apiService.getTheme();
      setTheme(themeColors);
      applyThemeToCSS(themeColors);
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      // Usar tema padrão em caso de erro
      setTheme(defaultTheme);
      applyThemeToCSS(defaultTheme);
    } finally {
      // Delay adicional para garantir que a animação seja vista
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const refreshTheme = async () => {
    await loadTheme();
  };

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    applyThemeToCSS(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, refreshTheme }}>
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
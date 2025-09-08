import React, { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { themeColors, loading } = useTheme();

  useEffect(() => {
    // Aplicar classe de tema no body para CSS global
    if (themeColors && !loading) {
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add('theme-applied');
    }
  }, [themeColors, loading]);

  return <>{children}</>;
}

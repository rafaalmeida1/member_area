import { useState, useEffect, useCallback } from 'react';
import { themeService, ThemeColors } from '@/services/themeService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function useTheme() {
  const [themeColors, setThemeColors] = useState<ThemeColors | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const loadTheme = useCallback(async () => {
    try {
      setLoading(true);
      const colors = await themeService.getUserThemeColors();
      setThemeColors(colors);
      themeService.applyThemeColors(colors);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateTheme = useCallback(async (colors: ThemeColors) => {
    try {
      const updatedColors = await themeService.updateUserThemeColors(colors);
      setThemeColors(updatedColors);
      themeService.applyThemeColors(updatedColors);
      return updatedColors;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const applyPredefinedTheme = useCallback(async (themeId: string) => {
    try {
      const colors = await themeService.applyPredefinedTheme(themeId);
      setThemeColors(colors);
      themeService.applyThemeColors(colors);
      return colors;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const refreshTheme = useCallback(() => {
    loadTheme();
  }, [loadTheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return {
    themeColors,
    loading,
    updateTheme,
    applyPredefinedTheme,
    refreshTheme
  };
}

import { privateApi } from './apiConfig';
import { ApiResponse } from './api';

export interface ThemeColors {
  themePrimaryColor: string;
  themeSecondaryColor: string;
  themeAccentColor: string;
  themeBackgroundColor: string;
  themeSurfaceColor: string;
  themeTextColor: string;
  themeTextSecondaryColor: string;
  themeBorderColor: string;
  themeInputBgColor: string;
  themeInputBorderColor: string;
  themeInputFocusColor: string;
  themeButtonPrimaryBg: string;
  themeButtonPrimaryHover: string;
  themeButtonPrimaryText: string;
  themeButtonSecondaryBg: string;
  themeButtonSecondaryHover: string;
  themeButtonSecondaryText: string;
  themeButtonDisabledBg: string;
  themeButtonDisabledText: string;
  themeSuccessColor: string;
  themeWarningColor: string;
  themeErrorColor: string;
  themeInfoColor: string;
  selectedTheme: string;
}

export interface PredefinedTheme {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  colors: ThemeColors;
}

class ThemeService {
  /**
   * Busca as cores do tema do usuário
   */
  async getUserThemeColors(): Promise<ThemeColors> {
    const response = await privateApi.get<ApiResponse<ThemeColors>>('/theme/colors');
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar cores do tema');
  }

  /**
   * Atualiza as cores do tema do usuário
   */
  async updateUserThemeColors(colors: ThemeColors): Promise<ThemeColors> {
    const response = await privateApi.put<ApiResponse<ThemeColors>>('/theme/colors', colors);
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao atualizar cores do tema');
  }

  /**
   * Busca temas pré-definidos
   */
  async getPredefinedThemes(): Promise<PredefinedTheme[]> {
    const response = await privateApi.get<ApiResponse<PredefinedTheme[]>>('/theme/predefined');
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar temas pré-definidos');
  }

  /**
   * Aplica um tema pré-definido
   */
  async applyPredefinedTheme(themeId: string): Promise<ThemeColors> {
    const response = await privateApi.post<ApiResponse<ThemeColors>>(`/theme/apply/${themeId}`);
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao aplicar tema');
  }

  /**
   * Aplica as cores do tema no CSS
   */
  applyThemeColors(colors: ThemeColors): void {
    const root = document.documentElement;
    
    // Cores principais
    root.style.setProperty('--color-primary', colors.themePrimaryColor);
    root.style.setProperty('--color-secondary', colors.themeSecondaryColor);
    root.style.setProperty('--color-accent', colors.themeAccentColor);
    root.style.setProperty('--color-background', colors.themeBackgroundColor);
    root.style.setProperty('--color-surface', colors.themeSurfaceColor);
    root.style.setProperty('--color-text', colors.themeTextColor);
    root.style.setProperty('--color-text-secondary', colors.themeTextSecondaryColor);
    root.style.setProperty('--color-border', colors.themeBorderColor);
    
    // Cores de input
    root.style.setProperty('--color-input-bg', colors.themeInputBgColor);
    root.style.setProperty('--color-input-border', colors.themeInputBorderColor);
    root.style.setProperty('--color-input-focus', colors.themeInputFocusColor);
    
    // Cores de botão
    root.style.setProperty('--color-button-primary-bg', colors.themeButtonPrimaryBg);
    root.style.setProperty('--color-button-primary-hover', colors.themeButtonPrimaryHover);
    root.style.setProperty('--color-button-primary-text', colors.themeButtonPrimaryText);
    root.style.setProperty('--color-button-secondary-bg', colors.themeButtonSecondaryBg);
    root.style.setProperty('--color-button-secondary-hover', colors.themeButtonSecondaryHover);
    root.style.setProperty('--color-button-secondary-text', colors.themeButtonSecondaryText);
    root.style.setProperty('--color-button-disabled-bg', colors.themeButtonDisabledBg);
    root.style.setProperty('--color-button-disabled-text', colors.themeButtonDisabledText);
    
    // Cores de status
    root.style.setProperty('--color-success', colors.themeSuccessColor);
    root.style.setProperty('--color-warning', colors.themeWarningColor);
    root.style.setProperty('--color-error', colors.themeErrorColor);
    root.style.setProperty('--color-info', colors.themeInfoColor);
  }
}

export const themeService = new ThemeService();

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, EyeOff, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, ThemeColors } from '@/services/api';
import './ThemeManager.css';

interface ThemeManagerProps {
  onThemeChange?: (theme: ThemeColors) => void;
}

// Temas pré-definidos
const PRESET_THEMES = {
  'Elegant': {
    primaryColor: '#DBCFCB',
    secondaryColor: '#D8C4A4',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#FAFAFA',
    textPrimaryColor: '#2C2C2C',
    textSecondaryColor: '#666666',
    borderColor: '#E0E0E0',
    hoverColor: '#F0F0F0',
    disabledColor: '#CCCCCC'
  },
  'Nature': {
    primaryColor: '#8FBC8F',
    secondaryColor: '#A8D5BA',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8F9FA',
    textPrimaryColor: '#2C3E50',
    textSecondaryColor: '#7F8C8D',
    borderColor: '#E8F5E8',
    hoverColor: '#F0F8F0',
    disabledColor: '#CCCCCC'
  },
  'Ocean': {
    primaryColor: '#4A90E2',
    secondaryColor: '#7BB3F0',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FBFF',
    textPrimaryColor: '#2C3E50',
    textSecondaryColor: '#7F8C8D',
    borderColor: '#E3F2FD',
    hoverColor: '#F0F8FF',
    disabledColor: '#CCCCCC'
  },
  'Sunset': {
    primaryColor: '#FF6B6B',
    secondaryColor: '#FFB3BA',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#FFF8F8',
    textPrimaryColor: '#2C3E50',
    textSecondaryColor: '#7F8C8D',
    borderColor: '#FFE6E6',
    hoverColor: '#FFF0F0',
    disabledColor: '#CCCCCC'
  },
  'Dark': {
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#1A1A1A',
    surfaceColor: '#2C2C2C',
    textPrimaryColor: '#FFFFFF',
    textSecondaryColor: '#CCCCCC',
    borderColor: '#333333',
    hoverColor: '#3C3C3C',
    disabledColor: '#666666'
  }
};

export function ThemeManager({ onThemeChange }: ThemeManagerProps) {
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(PRESET_THEMES.Elegant);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar tema atual
  useEffect(() => {
    loadCurrentTheme();
  }, []);

  const loadCurrentTheme = async () => {
    try {
      const theme = await apiService.getTheme();
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const applyTheme = (theme: ThemeColors) => {
    setCurrentTheme(theme);
    setHasChanges(true);
    
    // Aplicar tema imediatamente para preview
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-background', theme.backgroundColor);
    root.style.setProperty('--color-surface', theme.surfaceColor);
    root.style.setProperty('--color-text-primary', theme.textPrimaryColor);
    root.style.setProperty('--color-text-secondary', theme.textSecondaryColor);
    root.style.setProperty('--color-border', theme.borderColor);
    root.style.setProperty('--color-hover', theme.hoverColor);
    root.style.setProperty('--color-disabled', theme.disabledColor);

    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  const saveTheme = async () => {
    try {
      setIsLoading(true);
      await apiService.updateTheme(currentTheme);
      setHasChanges(false);
      toast({
        title: "Tema salvo!",
        description: "As cores do seu site foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o tema. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetTheme = () => {
    applyTheme(PRESET_THEMES.Elegant);
  };

  return (
    <div className="theme-manager">
      {/* Header */}
      <div className="theme-manager-header">
        <div className="header-content">
          <div className="header-left">
            <Palette className="header-icon" />
            <div>
              <h3 className="header-title">Personalizar Tema</h3>
              <p className="header-subtitle">Escolha as cores do seu site</p>
            </div>
          </div>
          <div className="header-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="preview-button"
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Ocultar' : 'Preview'}
            </Button>
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetTheme}
                className="reset-button"
              >
                <RotateCcw className="w-4 h-4" />
                Resetar
              </Button>
            )}
            <Button
              onClick={saveTheme}
              disabled={!hasChanges || isLoading}
              className="save-button"
            >
              <Save className="w-4 h-4" />
              Salvar Tema
            </Button>
          </div>
        </div>
      </div>

      {/* Temas Pré-definidos */}
      <Card className="preset-themes-card">
        <CardHeader>
          <CardTitle className="card-title">
            <Sparkles className="w-5 h-5" />
            Temas Prontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="preset-grid">
            {Object.entries(PRESET_THEMES).map(([name, theme]) => (
              <div
                key={name}
                className={`preset-item ${isCurrentTheme(theme) ? 'active' : ''}`}
                onClick={() => applyTheme(theme)}
              >
                <div className="preset-preview">
                  <div 
                    className="color-preview"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                    }}
                  />
                  <div className="color-dots">
                    <div className="color-dot" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="color-dot" style={{ backgroundColor: theme.secondaryColor }} />
                    <div className="color-dot" style={{ backgroundColor: theme.backgroundColor }} />
                  </div>
                </div>
                <div className="preset-info">
                  <span className="preset-name">{name}</span>
                  <Badge variant={isCurrentTheme(theme) ? "default" : "secondary"} className="preset-badge">
                    {isCurrentTheme(theme) ? 'Ativo' : 'Aplicar'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview do Tema */}
      {previewMode && (
        <Card className="theme-preview-card">
          <CardHeader>
            <CardTitle className="card-title">Preview do Tema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="theme-preview">
              <div className="preview-header">
                <div className="preview-logo">Logo</div>
                <div className="preview-nav">
                  <span>Início</span>
                  <span>Módulos</span>
                  <span>Pacientes</span>
                </div>
              </div>
              <div className="preview-content">
                <div className="preview-card">
                  <h4>Exemplo de Card</h4>
                  <p>Este é como ficará o conteúdo com o tema escolhido.</p>
                  <Button size="sm">Ação</Button>
                </div>
                <div className="preview-sidebar">
                  <div className="sidebar-item">Menu Item 1</div>
                  <div className="sidebar-item">Menu Item 2</div>
                  <div className="sidebar-item">Menu Item 3</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  function isCurrentTheme(theme: ThemeColors): boolean {
    return (
      theme.primaryColor === currentTheme.primaryColor &&
      theme.secondaryColor === currentTheme.secondaryColor &&
      theme.backgroundColor === currentTheme.backgroundColor
    );
  }
} 
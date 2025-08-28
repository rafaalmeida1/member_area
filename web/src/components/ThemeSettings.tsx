import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import './ThemeSettings.css';

interface ColorField {
  key: keyof ThemeColors;
  label: string;
  description: string;
}

const colorFields: ColorField[] = [
  {
    key: 'primaryColor',
    label: 'Cor Primária',
    description: 'Cor principal usada em botões e elementos de destaque'
  },
  {
    key: 'secondaryColor',
    label: 'Cor Secundária',
    description: 'Cor complementar para elementos secundários'
  },
  {
    key: 'accentColor',
    label: 'Cor de Destaque',
    description: 'Cor para elementos que precisam de atenção especial'
  },
  {
    key: 'backgroundColor',
    label: 'Cor de Fundo',
    description: 'Cor de fundo principal da aplicação'
  },
  {
    key: 'surfaceColor',
    label: 'Cor de Superfície',
    description: 'Cor de fundo para cards e elementos elevados'
  },
  {
    key: 'textColor',
    label: 'Cor do Texto',
    description: 'Cor principal para textos'
  },
  {
    key: 'textSecondaryColor',
    label: 'Cor do Texto Secundário',
    description: 'Cor para textos menos importantes'
  }
];

export function ThemeSettings() {
  const { theme, refreshTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [localTheme, setLocalTheme] = useState<ThemeColors>(theme);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setLocalTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await apiService.updateTheme(localTheme);
      await refreshTheme();
      toast({
        title: "Tema atualizado",
        description: "As cores foram salvas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações do tema.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLocalTheme(theme);
  };

  const hasChanges = JSON.stringify(localTheme) !== JSON.stringify(theme);

  return (
    <div className="theme-settings">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Configurações de Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="theme-preview">
            <div className="preview-header">
              <h3>Prévia do Tema</h3>
              <p>Veja como as cores ficarão na aplicação</p>
            </div>
            <div className="preview-content" style={{ backgroundColor: localTheme.backgroundColor }}>
              <div className="preview-card" style={{ backgroundColor: localTheme.surfaceColor }}>
                <div className="preview-text" style={{ color: localTheme.textColor }}>
                  Texto principal
                </div>
                <div className="preview-text-secondary" style={{ color: localTheme.textSecondaryColor }}>
                  Texto secundário
                </div>
                <div className="preview-buttons">
                  <button 
                    className="preview-btn primary"
                    style={{ backgroundColor: localTheme.primaryColor, color: '#fff' }}
                  >
                    Botão Primário
                  </button>
                  <button 
                    className="preview-btn secondary"
                    style={{ backgroundColor: localTheme.secondaryColor, color: '#fff' }}
                  >
                    Botão Secundário
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="color-fields">
            {colorFields.map((field) => (
              <div key={field.key} className="color-field">
                <div className="color-field-header">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="color-preview">
                    <div 
                      className="color-swatch"
                      style={{ backgroundColor: localTheme[field.key] }}
                    />
                    <span className="color-value">{localTheme[field.key]}</span>
                  </div>
                </div>
                <p className="color-description">{field.description}</p>
                <Input
                  id={field.key}
                  type="color"
                  value={localTheme[field.key]}
                  onChange={(e) => handleColorChange(field.key, e.target.value)}
                  className="color-input"
                />
              </div>
            ))}
          </div>

          <div className="theme-actions">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="reset-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reverter
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="save-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Tema'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
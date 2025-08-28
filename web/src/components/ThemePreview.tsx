import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeColors } from '@/services/api';

interface ThemePreviewProps {
  theme: ThemeColors;
  title?: string;
  description?: string;
}

export function ThemePreview({ 
  theme, 
  title = "Preview do Tema", 
  description = "Como as cores personalizadas aparecerão no sistema" 
}: ThemePreviewProps) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview do Banner */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Banner Principal</div>
          <div 
            className="relative w-full h-20 overflow-hidden rounded-lg border"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <div 
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: theme.secondaryColor }}
            />
            <div className="relative z-10 h-full flex items-center px-3">
              <div style={{ color: theme.textColor }}>
                <div className="font-bold text-sm">Nome do Profissional</div>
                <div className="text-xs opacity-90">Especialista em Nutrição</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview de Cards */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Cards de Conteúdo</div>
          <div 
            className="p-3 rounded-lg border"
            style={{ backgroundColor: theme.surfaceColor }}
          >
            <h3 
              className="text-sm font-semibold mb-2"
              style={{ color: theme.textColor }}
            >
              Título do Módulo
            </h3>
            <p 
              className="text-xs mb-3"
              style={{ color: theme.textSecondaryColor }}
            >
              Descrição do módulo com as cores personalizadas aplicadas.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm"
                style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}
              >
                Ver Módulo
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                style={{ 
                  borderColor: theme.accentColor,
                  color: theme.textColor
                }}
              >
                Detalhes
              </Button>
            </div>
          </div>
        </div>

        {/* Preview de Botões */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Botões e Elementos</div>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm"
              style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}
            >
              Primário
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              style={{ 
                borderColor: theme.accentColor,
                color: theme.textColor
              }}
            >
              Secundário
            </Button>
            <Badge 
              style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}
            >
              Badge
            </Badge>
          </div>
        </div>

        {/* Preview de Texto */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Tipografia</div>
          <div style={{ color: theme.textColor }}>
            <h4 className="text-sm font-semibold mb-1">Título Principal</h4>
            <p 
              className="text-xs mb-2"
              style={{ color: theme.textSecondaryColor }}
            >
              Texto secundário com cor diferenciada
            </p>
            <p className="text-xs">Texto normal do corpo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
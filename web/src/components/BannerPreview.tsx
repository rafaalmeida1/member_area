import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Smartphone, Monitor } from 'lucide-react';

interface BannerPreviewProps {
  imageUrl?: string;
  title?: string;
  description?: string;
}

export function BannerPreview({ imageUrl, title = "Preview do Banner", description }: BannerPreviewProps) {
  const getBackgroundStyle = () => {
    return {
      backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview Mobile */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="w-3 h-3" />
            <span>Mobile (320px altura)</span>
          </div>
          <div className="relative w-full h-20 overflow-hidden rounded-lg border bg-muted">
            {imageUrl ? (
              <div 
                className="absolute inset-0"
                style={getBackgroundStyle()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10" />
            )}
            <div className="relative z-10 h-full flex items-center px-3">
              <div className="text-white text-xs">
                <div className="font-bold">Nome do Profissional</div>
                <div className="opacity-90">Especialista em Nutrição</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Desktop */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="w-3 h-3" />
            <span>Desktop (384px altura)</span>
          </div>
          <div className="relative w-full h-24 overflow-hidden rounded-lg border bg-muted">
            {imageUrl ? (
              <div 
                className="absolute inset-0"
                style={getBackgroundStyle()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10" />
            )}
            <div className="relative z-10 h-full flex items-center px-4">
              <div className="text-white">
                <div className="font-bold text-sm">Nome do Profissional</div>
                <div className="opacity-90 text-xs">Especialista em Nutrição</div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Dimensões recomendadas:</strong> 1920 × 640px (proporção 3:1)</p>
          <p><strong>Formato:</strong> JPG, PNG, WebP</p>
          <p><strong>Tamanho máximo:</strong> 10MB</p>
          <p><strong>Posicionamento:</strong> A imagem será centralizada e cortada automaticamente</p>
          <p><strong>Gradiente:</strong> Overlay escuro será aplicado automaticamente</p>
        </div>
      </CardContent>
    </Card>
  );
} 
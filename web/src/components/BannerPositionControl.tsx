import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move } from 'lucide-react';

interface BannerPositionControlProps {
  positionX: number;
  positionY: number;
  onPositionChange: (x: number, y: number) => void;
  imageUrl?: string;
}

export function BannerPositionControl({ 
  positionX, 
  positionY, 
  onPositionChange,
  imageUrl 
}: BannerPositionControlProps) {
  
  const handleXChange = (value: number[]) => {
    onPositionChange(value[0], positionY);
  };

  const handleYChange = (value: number[]) => {
    onPositionChange(positionX, value[0]);
  };

  const resetPosition = () => {
    onPositionChange(50, 50);
  };

  const getPreviewStyle = () => ({
    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundRepeat: 'no-repeat'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Move className="w-5 h-5" />
          Posicionamento do Banner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Preview Visual */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preview do Posicionamento</label>
          <div className="relative w-full h-32 overflow-hidden rounded-lg border bg-muted">
            {imageUrl ? (
              <div 
                className="absolute inset-0"
                style={getPreviewStyle()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10" />
            )}
            
            {/* Indicador de posição */}
            <div 
              className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${positionX}%`,
                top: `${positionY}%`
              }}
            />
            
            <div className="relative z-10 h-full flex items-center px-4">
              <div className="text-white">
                <div className="font-bold text-sm">Nome do Profissional</div>
                <div className="opacity-90 text-xs">Especialista em Nutrição</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Posição */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Posição Horizontal (X)</label>
              <span className="text-sm text-muted-foreground">{positionX}%</span>
            </div>
            <Slider
              value={[positionX]}
              onValueChange={handleXChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Esquerda</span>
              <span>Centro</span>
              <span>Direita</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Posição Vertical (Y)</label>
              <span className="text-sm text-muted-foreground">{positionY}%</span>
            </div>
            <Slider
              value={[positionY]}
              onValueChange={handleYChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Topo</span>
              <span>Centro</span>
              <span>Base</span>
            </div>
          </div>
        </div>

        {/* Botão Reset */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetPosition}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Centralizar
          </Button>
        </div>

        {/* Informações */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
          <p><strong>Como usar:</strong></p>
          <p>• Arraste os sliders para ajustar a posição da imagem</p>
          <p>• O ponto branco mostra o centro da imagem</p>
          <p>• 0% = borda esquerda/topo, 100% = borda direita/base</p>
          <p>• Clique em "Centralizar" para voltar ao centro (50%, 50%)</p>
        </div>
      </CardContent>
    </Card>
  );
} 
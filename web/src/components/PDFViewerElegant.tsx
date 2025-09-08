import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, ExternalLink, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFViewerElegantProps {
  url: string;
  className?: string;
}

export function PDFViewerElegant({ url, className = '' }: PDFViewerElegantProps) {
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'documento.pdf';
    link.click();
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
  };

  if (hasError) {
    return (
      <div className={`border rounded-lg bg-muted/30 ${className}`}>
        <div className="flex items-center justify-between p-3 border-b bg-background/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">PDF Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="w-4 h-4 mr-1" />
              Baixar
            </Button>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Preview não disponível
          </p>
          <p className="text-xs text-muted-foreground">
            Use os botões acima para visualizar o PDF
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg bg-background ${className}`}>
      {/* Controles */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium">PDF Preview</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={zoomIn} disabled={scale >= 2.0}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={rotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={resetView}>
            Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={openInNewTab}>
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadPDF}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Visualizador PDF */}
      <div className="relative bg-gray-50 dark:bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carregando PDF...</p>
            </div>
          </div>
        )}
        
        <div 
          className="overflow-auto"
          style={{ 
            height: '500px',
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'top left'
          }}
        >
          <iframe
            ref={iframeRef}
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title="PDF Preview"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            style={{
              minHeight: '600px',
              width: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
}

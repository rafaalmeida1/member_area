import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Configurar worker do PDF.js - usar versão local ou fallback
try {
  // Tentar usar worker local primeiro
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
} catch (error) {
  // Fallback para CDN se local falhar
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className = '' }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Erro ao carregar PDF:', error);
    setError('Erro ao carregar o PDF. Verifique se a URL está correta.');
    setIsLoading(false);
    toast({
      title: "Erro ao carregar PDF",
      description: "Não foi possível carregar o documento PDF.",
      variant: "destructive",
    });
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
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

  if (error) {
    return (
      <div className={`border rounded-md p-6 bg-muted/50 text-center ${className}`}>
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            Abrir em nova aba
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPDF}>
            Baixar PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-md bg-muted/50 ${className}`}>
      {/* Controles */}
      <div className="flex items-center justify-between p-3 border-b bg-background/50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {pageNumber} de {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={rotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            Abrir em nova aba
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPDF}>
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Visualizador PDF */}
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando PDF...</span>
          </div>
        )}
        
        <div className="flex justify-center">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando PDF...</span>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}

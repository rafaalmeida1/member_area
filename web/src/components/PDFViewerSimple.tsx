import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFViewerSimpleProps {
  url: string;
  className?: string;
}

export function PDFViewerSimple({ url, className = '' }: PDFViewerSimpleProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const openInNewTab = () => {
    try {
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Erro ao abrir PDF",
        description: "Não foi possível abrir o PDF em nova aba.",
        variant: "destructive",
      });
    }
  };

  const downloadPDF = () => {
    try {
      setIsLoading(true);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'documento.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: "O download do PDF foi iniciado.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o PDF.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testPDFAccess = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        toast({
          title: "PDF acessível",
          description: "O PDF está disponível e pode ser visualizado.",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erro ao acessar PDF",
        description: "Não foi possível acessar o PDF. Verifique se a URL está correta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`border rounded-md bg-muted/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/50">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium">Documento PDF</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={testPDFAccess}
          disabled={isLoading}
        >
          {isLoading ? "Testando..." : "Testar Acesso"}
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 text-center">
        <div className="mb-6">
          <FileText className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Documento PDF</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Clique nos botões abaixo para visualizar ou baixar o documento
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="default"
            onClick={openInNewTab}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir em Nova Aba
          </Button>
          
          <Button 
            variant="outline"
            onClick={downloadPDF}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isLoading ? "Baixando..." : "Baixar PDF"}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Dica:</strong> Para melhor experiência, use "Abrir em Nova Aba" 
            para visualizar o PDF com os controles nativos do navegador.
          </p>
        </div>
      </div>
    </div>
  );
}

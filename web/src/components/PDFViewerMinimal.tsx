import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFViewerMinimalProps {
  url: string;
  className?: string;
}

export function PDFViewerMinimal({ url, className = '' }: PDFViewerMinimalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const openInNewTab = () => {
    try {
      window.open(url, '_blank');
      toast({
        title: "PDF aberto",
        description: "O PDF foi aberto em uma nova aba.",
      });
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

  return (
    <Card className={`border border-gray-200 bg-white shadow-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-md">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Documento PDF</p>
              <p className="text-xs text-gray-500">Pronto para visualização</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Abrir
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              disabled={isLoading}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Download className="w-3 h-3 mr-1" />
              {isLoading ? "..." : "Baixar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

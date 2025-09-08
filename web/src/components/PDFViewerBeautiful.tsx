import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ExternalLink, Download, Eye, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFViewerBeautifulProps {
  url: string;
  className?: string;
}

export function PDFViewerBeautiful({ url, className = '' }: PDFViewerBeautifulProps) {
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

  const previewPDF = () => {
    try {
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Erro ao visualizar",
        description: "Não foi possível abrir o PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`border-0 shadow-sm bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 ${className}`}>
      <CardContent className="p-0">
        {/* Header elegante */}
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Documento PDF</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clique para visualizar ou baixar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previewPDF}
                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="p-8">
          <div className="text-center">
            {/* Ícone grande e elegante */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-12 h-12 text-red-500 dark:text-red-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">PDF</span>
              </div>
            </div>

            {/* Texto descritivo */}
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Documento PDF Disponível
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Este documento está pronto para visualização. Escolha uma das opções abaixo para acessar o conteúdo.
            </p>

            {/* Botões de ação elegantes */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button
                onClick={openInNewTab}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir em Nova Aba
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadPDF}
                disabled={isLoading}
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                {isLoading ? "Baixando..." : "Baixar PDF"}
              </Button>
            </div>

            {/* Dica elegante */}
            <div className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-red-100 dark:border-red-900/30">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    💡 Dica para melhor experiência
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Use "Abrir em Nova Aba" para visualizar o PDF com todos os controles nativos do navegador, 
                    incluindo zoom, busca e navegação por páginas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

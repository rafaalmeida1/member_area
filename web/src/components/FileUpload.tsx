import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { InlineLoading } from '@/components/LoadingSpinner';
import { Upload, Link, Image, Video, Volume2, FileText, X, Check, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '../services/api';

interface FileUploadProps {
  type: 'image' | 'video' | 'audio' | 'pdf';
  onFileSelect: (url: string) => void;
  currentUrl?: string;
  field: string;
  setFormData?: (data: Record<string, unknown>) => void;
  formData?: Record<string, unknown>;
  // Especificações para orientar o usuário
  specifications?: {
    title: string;
    description: string;
    dimensions?: string;
    format?: string;
    maxSize?: string;
    tips?: string[];
  };
}

export function FileUpload({ 
  type, 
  onFileSelect, 
  currentUrl, 
  field, 
  setFormData, 
  formData,
  specifications
}: FileUploadProps) {
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFileType = (file: File, expectedType: string): boolean => {
    switch (expectedType) {
      case 'image':
        return file.type.startsWith('image/');
      case 'video':
        return file.type.startsWith('video/');
      case 'audio':
        return file.type.startsWith('audio/');
      case 'pdf':
        return file.type === 'application/pdf';
      default:
        return false;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    const isValidType = validateFileType(file, type);
    if (!isValidType) {
      toast({
        title: "Tipo de arquivo inválido",
        description: `Por favor, selecione um arquivo de ${type}.`,
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Upload direto
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await apiService.uploadFile(file, type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onFileSelect(response.publicUrl);
        setFormData?.({
          ...formData,
          [field]: response.publicUrl
        });
        toast({
          title: "Upload concluído",
          description: "Arquivo enviado com sucesso!",
        });
        setUploadProgress(0);
      }, 500);
      
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Digite uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    setIsLinking(true);
    
    try {
      const response = await apiService.linkExternalMedia({
        url: urlInput.trim(),
        type: type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO'
      });
      
      onFileSelect(response.externalUrl);
      setFormData?.({
        ...formData,
        [field]: response.externalUrl
      });
      toast({
        title: "Link adicionado",
        description: "URL externa vinculada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao vincular URL",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const clearSelection = () => {
    setUrlInput('');
    onFileSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-muted-foreground" />;
      case 'video': return <Video className="w-8 h-8 text-muted-foreground" />;
      case 'audio': return <Volume2 className="w-8 h-8 text-muted-foreground" />;
      case 'pdf': return <FileText className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getAcceptedTypes = () => {
    switch (type) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'pdf': return 'application/pdf';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'image': return 'Imagem';
      case 'video': return 'Vídeo';
      case 'audio': return 'Áudio';
      case 'pdf': return 'PDF';
    }
  };

  const renderSpecifications = () => {
    if (!specifications) return null;

    return (
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {specifications.title}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {specifications.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {specifications.dimensions && (
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Dimensões:</span>
                    <p className="text-blue-700 dark:text-blue-300">{specifications.dimensions}</p>
                  </div>
                )}
                
                {specifications.format && (
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Formato:</span>
                    <p className="text-blue-700 dark:text-blue-300">{specifications.format}</p>
                  </div>
                )}
                
                {specifications.maxSize && (
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Tamanho máximo:</span>
                    <p className="text-blue-700 dark:text-blue-300">{specifications.maxSize}</p>
                  </div>
                )}
              </div>

              {specifications.tips && specifications.tips.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-blue-800 dark:text-blue-200 text-sm">Dicas:</span>
                  <ul className="mt-1 space-y-1">
                    {specifications.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPreview = () => {
    if (!currentUrl) return null;

    return (
      <Card className="mt-4 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Arquivo selecionado</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {currentUrl}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {type === 'image' && (
            <div className="mt-3">
              <img 
                src={currentUrl} 
                alt="Preview" 
                className="max-w-full h-32 object-cover rounded-md"
                onError={() => {
                  toast({
                    title: "Erro ao carregar imagem",
                    description: "Verifique se a URL está correta.",
                    variant: "destructive",
                  });
                }}
              />
            </div>
          )}
          
          {type === 'pdf' && (
            <div className="mt-3">
              <div className="border rounded-md p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">PDF Preview</span>
                </div>
                <iframe
                  src={currentUrl}
                  className="w-full h-64 border rounded"
                  title="PDF Preview"
                  onError={() => {
                    toast({
                      title: "Erro ao carregar PDF",
                      description: "Verifique se a URL está correta.",
                      variant: "destructive",
                    });
                  }}
                />
                <div className="mt-2 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(currentUrl, '_blank')}
                  >
                    Abrir em nova aba
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = currentUrl;
                      link.download = 'documento.pdf';
                      link.click();
                    }}
                  >
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Especificações */}
      {renderSpecifications()}

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            URL Externa
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-input">URL do {getTypeLabel()}</Label>
            <div className="flex gap-2">
              <Input
                id="url-input"
                placeholder={`Digite a URL do ${type} (ex: https://...)`}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isLinking}
              />
              <Button 
                onClick={handleUrlSubmit} 
                disabled={!urlInput.trim() || isLinking}
                className="px-6"
              >
                <InlineLoading loading={isLinking} loadingText="Vinculando...">
                  <Link className="w-4 h-4 mr-2" />
                  Vincular
                </InlineLoading>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cole a URL completa do {type} que deseja usar
            </p>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Enviando arquivo...</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  {getTypeIcon()}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Enviar {getTypeLabel()}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Arraste e solte ou clique para selecionar um arquivo
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Máximo 10MB • Formatos aceitos: {getAcceptedTypes()}
                </p>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedTypes()}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        </TabsContent>
      </Tabs>

      {renderPreview()}
    </div>
  );
}
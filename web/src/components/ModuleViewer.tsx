import { ModuleDetail, ContentBlock, apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingWrapper } from '@/components/LoadingSpinner';
import { ModernLayout } from '@/components/ModernLayout';
import { PDFViewerMinimal } from '@/components/PDFViewerMinimal';
import { ArrowLeft, FileText, Video, Volume2, Calendar, User, Eye, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function ModuleViewer() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModule = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const moduleData = await apiService.getModuleById(id);
        setModule(moduleData);
      } catch (error) {
        console.error('Erro ao carregar módulo:', error);
        toast({
          title: "Erro ao carregar módulo",
          description: error instanceof Error ? error.message : "Erro inesperado",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
  }, [id, navigate, toast]);

  const handleBack = () => {
    navigate('/');
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <FileText className="w-5 h-5 text-primary" />;
      case 'VIDEO': return <Video className="w-5 h-5 text-primary" />;
      case 'AUDIO': return <Volume2 className="w-5 h-5 text-primary" />;
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  const renderContent = (block: ContentBlock) => {
    switch (block.type) {
      case 'TEXT':
        return (
          <Card className="border-l-4 border-l-color-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {getContentIcon(block.type)}
                <span className="font-medium text-sm text-muted-foreground">
                  Conteúdo {block.order}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div 
                  className="text-foreground leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br/>') }}
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case 'VIDEO': {
        const isYouTube = block.content.includes('youtube.com') || block.content.includes('youtu.be');
        const isVimeo = block.content.includes('vimeo.com');
        
        // Função para extrair o ID do vídeo do YouTube
        const getYouTubeEmbedUrl = (url: string) => {
          const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
          const match = url.match(youtubeRegex);
          if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
          }
          return url;
        };

        // Função para extrair o ID do vídeo do Vimeo
        const getVimeoEmbedUrl = (url: string) => {
          const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
          const match = url.match(vimeoRegex);
          if (match) {
            return `https://player.vimeo.com/video/${match[1]}`;
          }
          return url;
        };

        // Determinar a URL de embed correta
        let embedUrl = block.content;
        if (isYouTube) {
          embedUrl = getYouTubeEmbedUrl(block.content);
        } else if (isVimeo) {
          embedUrl = getVimeoEmbedUrl(block.content);
        }
        
        return (
          <Card className="border-l-4 border-l-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {getContentIcon(block.type)}
                <span className="font-medium text-sm text-muted-foreground">
                  Vídeo {block.order}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
                {(isYouTube || isVimeo) ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    title={`Vídeo ${block.order}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={block.content}
                    controls
                    className="w-full h-full"
                    title={`Vídeo ${block.order}`}
                  >
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                )}
              </div>
            </CardContent>
          </Card>
        );
      }
        
      case 'PDF':
        return (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              {getContentIcon(block.type)}
              <span className="font-medium text-sm text-muted-foreground">
                PDF {block.order}
              </span>
            </div>
            <PDFViewerMinimal url={block.content} />
          </div>
        );
        
      case 'AUDIO':
        return (
          <Card className="border-l-4 border-l-secondary/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {getContentIcon(block.type)}
                <span className="font-medium text-sm text-muted-foreground">
                  Áudio {block.order}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <audio
                  src={block.content}
                  controls
                  className="w-full"
                  title={`Áudio ${block.order}`}
                >
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return (
          <Card className="border-l-4 border-l-muted">
            <CardContent className="p-4">
              <p className="text-muted-foreground">Tipo de conteúdo não suportado: {block.type}</p>
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoading) {
    return (
      <ModernLayout title="Carregando módulo..." showSidebar={false}>
        <LoadingWrapper loading={true}>
          <div>Carregando módulo...</div>
        </LoadingWrapper>
      </ModernLayout>
    );
  }

  if (!module) {
    return (
      <ModernLayout title="Módulo não encontrado" showSidebar={false}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Módulo não encontrado</h1>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout 
      title={module.title}
      showSidebar={false}
      showBackButton={true}
      onBack={handleBack}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">
                {module.category}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
              <p className="text-muted-foreground text-lg mb-4">
                {module.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(module.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Por {module.createdBy.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{module.content.length} conteúdo{module.content.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
          
          {module.coverImage && (
            <div className="relative h-64 rounded-lg overflow-hidden mb-6">
              <img
                src={module.coverImage}
                alt={module.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
        </div>

        {/* Content Blocks */}
        <div className="space-y-6">
          {module.content.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Este módulo ainda não possui conteúdo.</p>
              </CardContent>
            </Card>
          ) : (
            module.content.map((block) => (
              <div key={block.id}>
                {renderContent(block)}
              </div>
            ))
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/FileUpload';
import { FileText, Video, Volume2, Trash2, GripVertical } from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'TEXT' | 'VIDEO' | 'AUDIO' | 'PDF';
  content: string;
  order: number;
}

interface DraggableContentListProps {
  contentBlocks: ContentBlock[];
  onContentBlocksChange: (blocks: ContentBlock[]) => void;
  formData: any;
  setFormData: (data: any) => void;
}

export function DraggableContentList({ 
  contentBlocks, 
  onContentBlocksChange, 
  formData, 
  setFormData 
}: DraggableContentListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <FileText className="w-4 h-4" />;
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'AUDIO': return <Volume2 className="w-4 h-4" />;
      case 'PDF': return <FileText className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const addContentBlock = () => {
    const newBlock = {
      id: Date.now().toString(),
      type: 'TEXT' as 'TEXT' | 'VIDEO' | 'AUDIO' | 'PDF',
      content: '',
      order: contentBlocks.length + 1
    };
    onContentBlocksChange([...contentBlocks, newBlock]);
  };

  // Função para garantir que os índices estejam sempre sequenciais
  const ensureSequentialOrder = (blocks: ContentBlock[]): ContentBlock[] => {
    return blocks.map((block, index) => ({
      ...block,
      order: index + 1
    }));
  };

  const updateContentBlock = (id: string, field: string, value: string) => {
    const updatedBlocks = contentBlocks.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    );
    onContentBlocksChange(updatedBlocks);
  };

  const removeContentBlock = (id: string) => {
    const filteredBlocks = contentBlocks.filter(block => block.id !== id);
    // Garantir que os índices estejam sequenciais
    const reorderedBlocks = ensureSequentialOrder(filteredBlocks);
    onContentBlocksChange(reorderedBlocks);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
    
    // Adicionar classe visual ao elemento sendo arrastado
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5';
      e.currentTarget.style.transform = 'rotate(2deg)';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newBlocks = [...contentBlocks];
    const draggedBlock = newBlocks[draggedIndex];
    
    // Remover o bloco da posição original
    newBlocks.splice(draggedIndex, 1);
    
    // Inserir na nova posição
    newBlocks.splice(dropIndex, 0, draggedBlock);
    
    // Garantir que os índices estejam sequenciais
    const reorderedBlocks = ensureSequentialOrder(newBlocks);

    onContentBlocksChange(reorderedBlocks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Remover classes visuais
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.transform = 'rotate(0deg)';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Conteúdo do Módulo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste e solte para reordenar os conteúdos
          </p>
        </div>
        <Button onClick={addContentBlock} variant="outline" size="sm">
          Adicionar Conteúdo
        </Button>
      </div>

      <div className="space-y-3">
        {contentBlocks.map((block, index) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`draggable-item transition-all duration-200 ${
              dragOverIndex === index && draggedIndex !== index
                ? 'drag-over'
                : ''
            } ${
              draggedIndex === index
                ? 'dragging'
                : ''
            }`}
          >
            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="drag-handle p-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      {getContentIcon(block.type)}
                      <span className="font-medium text-sm">
                        Bloco {block.order}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeContentBlock(block.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={block.type}
                  onValueChange={(value: 'TEXT' | 'VIDEO' | 'AUDIO') =>
                    updateContentBlock(block.id, 'type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Texto</SelectItem>
                    <SelectItem value="VIDEO">Vídeo</SelectItem>
                    <SelectItem value="AUDIO">Áudio</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                  </SelectContent>
                </Select>

                {block.type === 'TEXT' ? (
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                    placeholder="Digite o conteúdo textual..."
                    rows={4}
                  />
                ) : (
                  <FileUpload
                    type={block.type.toLowerCase() as 'video' | 'audio' | 'pdf'}
                    currentUrl={block.content}
                    field="content"
                    onFileSelect={(publicUrl) => updateContentBlock(block.id, 'content', publicUrl)}
                    setFormData={(data: Record<string, unknown>) => {
                      setFormData(prev => ({ ...prev, ...data }));
                    }}
                    formData={formData}
                    specifications={block.type === 'VIDEO' ? {
                      title: "Vídeo Educacional",
                      description: "Este vídeo será exibido no conteúdo do módulo",
                      format: "MP4, WebM, MOV",
                      maxSize: "100MB",
                      tips: [
                        "Use vídeos de boa qualidade e resolução",
                        "Recomendamos resolução mínima de 720p",
                        "Mantenha o vídeo focado no conteúdo educacional",
                        "Evite vídeos muito longos (recomendado até 10 minutos)",
                        "Certifique-se de que o áudio está claro"
                      ]
                    } : block.type === 'AUDIO' ? {
                      title: "Áudio Educacional",
                      description: "Este áudio será reproduzido no conteúdo do módulo",
                      format: "MP3, WAV, AAC",
                      maxSize: "50MB",
                      tips: [
                        "Use áudio de boa qualidade (mínimo 128kbps)",
                        "Certifique-se de que a voz está clara e bem gravada",
                        "Evite ruídos de fundo",
                        "Recomendamos duração de até 15 minutos",
                        "Use um microfone de boa qualidade para gravação"
                      ]
                    } : {
                      title: "Documento PDF",
                      description: "Este PDF será exibido no conteúdo do módulo",
                      format: "PDF",
                      maxSize: "20MB",
                      tips: [
                        "Use PDFs com texto selecionável (não apenas imagens)",
                        "Certifique-se de que o conteúdo está bem formatado",
                        "Evite PDFs muito grandes ou com muitas páginas",
                        "Recomendamos até 50 páginas por documento",
                        "Use fontes legíveis e tamanho adequado"
                      ]
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {contentBlocks.length === 0 && (
        <Card className="border-dashed border-border/50 text-center py-8">
          <CardContent>
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum conteúdo adicionado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione conteúdo ao seu módulo arrastando e soltando para reordenar.
            </p>
            <Button onClick={addContentBlock} variant="outline">
              Adicionar Primeiro Conteúdo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
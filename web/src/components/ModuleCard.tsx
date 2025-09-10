import { Module } from '@/services/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Video, Volume2, User, GripVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModuleCardProps {
  module: Module;
  onView?: (module: Module) => void;
  onEdit?: (module: Module) => void;
  onDelete?: (moduleId: string) => void;
  isProfessional?: boolean;
  isDraggable?: boolean;
  isDeleting?: boolean;
}

export function ModuleCard({ 
  module, 
  onView, 
  onEdit, 
  onDelete, 
  isProfessional = false, 
  isDraggable = false,
  isDeleting = false 
}: ModuleCardProps) {
  const getContentTypeIcons = () => {
    // Para a listagem de módulos, usamos o contentCount para simular os tipos
    // Em uma implementação real, você poderia ter um campo de tipos de conteúdo
    const icons = [];
    
    if (module.contentCount > 0) {
      icons.push(<FileText key="text" className="w-4 h-4" />);
      // Adicione outros ícones baseado em alguma lógica ou dados adicionais
    }
    
    return icons.length > 0 ? icons : [<FileText key="default" className="w-4 h-4" />];
  };

  const handleClick = () => {
    if (onView) {
      onView(module);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(module);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(module.id);
    }
  };

  return (
    <Card 
      className={`group hover:shadow-elegant w-full transition-all duration-500 hover:scale-[1.02] bg-card border-[var(--color-border)] hover:border-[var(--color-primary)] overflow-hidden ${
        onView ? 'cursor-pointer' : ''
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onClick={handleClick}
    >
      {/* Cover Image - Full Card */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={module.coverImage}
          alt={module.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Drag Handle for Professionals */}
        {isProfessional && isDraggable && (
          <div className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-black/90 rounded-full backdrop-blur-sm cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        
        {/* Action Buttons for Professionals */}
        {isProfessional && (
          <div className="absolute top-3 right-3 flex gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleEdit}
                className="p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm hover:bg-white dark:hover:bg-black"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 bg-red-500/90 backdrop-blur-sm hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        
        {/* Content Type Icons */}
        {!isProfessional && (
          <div className="absolute top-3 right-3 flex gap-1">
            {getContentTypeIcons().map((icon, index) => (
              <div
                key={index}
                className="p-2 bg-white/90 dark:bg-black/90 rounded-full backdrop-blur-sm"
              >
                {icon}
              </div>
            ))}
          </div>
        )}
        
        {/* Module Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs bg-white/20 backdrop-blur-sm text-white border-white/30">
              {module.category}
            </Badge>
            {isProfessional && (
              <Badge variant="outline" className="text-xs bg-white/20 backdrop-blur-sm text-white border-white/30">
                Ordem: {module.orderIndex + 1}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg leading-tight mb-2">
            {module.title}
          </h3>
          <div className="flex items-center gap-2 text-xs opacity-90">
            <Calendar className="w-3 h-3" />
            <span>{new Date(module.createdAt).toLocaleDateString('pt-BR')}</span>
            <span className="mx-2">•</span>
            <span>{module.contentCount} conteúdos</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
import { Module } from '@/services/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Video, Volume2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModuleCardProps {
  module: Module;
  onView: (module: Module) => void;
}

export function ModuleCard({ module, onView }: ModuleCardProps) {
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

  return (
    <Card 
      className="group hover:shadow-elegant w-72 transition-all duration-500 hover:scale-[1.02] bg-card border-border/50 hover:border-primary/30 overflow-hidden cursor-pointer"
      onClick={() => onView(module)}
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
        
        {/* Content Type Icons */}
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
        
        {/* Module Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <Badge variant="secondary" className="mb-2 text-xs bg-white/20 backdrop-blur-sm text-white border-white/30">
            {module.category}
          </Badge>
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
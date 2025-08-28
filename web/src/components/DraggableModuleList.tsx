import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Module } from '@/services/api';
import { ModuleCard } from './ModuleCard';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import './DraggableModuleList.css';

interface DraggableModuleListProps {
  modules: Module[];
  onModulesChange: (modules: Module[]) => void;
  onSaveOrder?: () => void;
  onEdit?: (module: Module) => void;
  onDelete?: (moduleId: string) => void;
  isProfessional?: boolean;
  isDeleting?: string | null;
}

interface SortableModuleCardProps {
  module: Module;
  isProfessional?: boolean;
  onEdit?: (module: Module) => void;
  onDelete?: (moduleId: string) => void;
  isDeleting?: string | null;
}

function SortableModuleCard({ module, isProfessional, onEdit, onDelete, isDeleting }: SortableModuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ModuleCard 
        module={module} 
        isProfessional={isProfessional}
        isDraggable={true}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting === module.id}
      />
    </div>
  );
}

export function DraggableModuleList({ 
  modules, 
  onModulesChange, 
  onSaveOrder,
  onEdit,
  onDelete,
  isProfessional = false,
  isDeleting = null
}: DraggableModuleListProps) {
  const { toast } = useToast();
  const [originalOrder, setOriginalOrder] = useState<Module[]>(modules);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex(module => module.id === active.id);
      const newIndex = modules.findIndex(module => module.id === over?.id);

      const newModules = arrayMove(modules, oldIndex, newIndex);
      
      // Atualizar orderIndex baseado na nova posição
      const updatedModules = newModules.map((module, index) => ({
        ...module,
        orderIndex: index
      }));

      onModulesChange(updatedModules);
      setHasChanges(true);
    }
  };

  const handleSaveOrder = async () => {
    try {
      const reorderRequests = modules.map((module, index) => ({
        moduleId: module.id,
        newOrderIndex: index
      }));

      await apiService.reorderModules(reorderRequests);
      
      setOriginalOrder([...modules]);
      setHasChanges(false);
      
      toast({
        title: "Ordem salva!",
        description: "A ordem dos módulos foi atualizada com sucesso.",
      });

      if (onSaveOrder) {
        onSaveOrder();
      }
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a nova ordem dos módulos.",
        variant: "destructive",
      });
    }
  };

  const handleResetOrder = () => {
    onModulesChange([...originalOrder]);
    setHasChanges(false);
  };

  return (
    <div className="draggable-module-list space-y-4">
      {/* Controles de ordenação */}
      {isProfessional && (
        <div className="order-controls">
          <div className="controls-left">
            <span className="text-sm text-muted-foreground">
              Arraste os módulos para reordenar
            </span>
          </div>
          <div className="controls-right">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetOrder}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Desfazer</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSaveOrder}
              disabled={!hasChanges}
              className="flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Ordem</span>
            </Button>
          </div>
        </div>
      )}

      {/* Lista de módulos */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={modules.map(module => module.id)}
          strategy={rectSortingStrategy}
        >
          <div className="draggable-module-grid">
            {modules.map((module) => (
              <SortableModuleCard
                key={module.id}
                module={module}
                isProfessional={isProfessional}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DragHandleProps {
  ref: React.Ref<HTMLDivElement>;
  [key: string]: any;
}

interface SortableItemProps {
  id: number;
  children: React.ReactNode | ((props: { dragHandleProps?: DragHandleProps }) => React.ReactNode);
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps: DragHandleProps = {
    ref: setActivatorNodeRef,
    ...attributes,
    ...listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {typeof children === 'function' 
        ? children({ dragHandleProps })
        : children
      }
    </div>
  );
}

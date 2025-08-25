import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  card?: boolean;
  className?: string;
}

export function LoadingSpinner({ 
  message = 'Carregando...', 
  size = 'md', 
  overlay = false,
  card = false,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-color-secondary`} />
      <p className={`${textSizes[size]} text-muted-foreground font-medium`}>
        {message}
      </p>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
        {card ? (
          <Card className="shadow-elegant border-border/50">
            <CardContent className="p-8">
              {content}
            </CardContent>
          </Card>
        ) : (
          content
        )}
      </div>
    );
  }

  if (card) {
    return (
      <Card className="shadow-elegant border-border/50">
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}

interface LoadingWrapperProps {
  loading: boolean;
  loadingMessage?: string;
  children: ReactNode;
  overlay?: boolean;
  card?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingWrapper({ 
  loading, 
  loadingMessage, 
  children, 
  overlay = false,
  card = false,
  size = 'md'
}: LoadingWrapperProps) {
  if (loading) {
    return (
      <LoadingSpinner 
        message={loadingMessage} 
        overlay={overlay} 
        card={card}
        size={size}
      />
    );
  }

  return <>{children}</>;
}

// Componente para loading inline (dentro de botões)
interface InlineLoadingProps {
  loading: boolean;
  children: ReactNode;
  loadingText?: string;
}

export function InlineLoading({ loading, children, loadingText }: InlineLoadingProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        {loadingText && <span>{loadingText}</span>}
      </div>
    );
  }

  return <>{children}</>;
}
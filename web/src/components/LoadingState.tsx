import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingText?: string;
  emptyText?: string;
  showEmpty?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading = false,
  error = null,
  onRetry,
  loadingText = 'Carregando...',
  emptyText = 'Nenhum item encontrado',
  showEmpty = false,
  className = 'min-h-[400px]'
}) => {
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900">Oops! Algo deu errado</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-4xl mb-4">📭</div>
          <p className="text-gray-500">{emptyText}</p>
        </div>
      </div>
    );
  }

  return null;
};

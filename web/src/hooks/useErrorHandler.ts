import { useCallback } from 'react';
import { useToast } from './use-toast';
import { parseApiError, createErrorHandler } from '@/lib/errorUtils';

/**
 * Hook personalizado para tratamento padronizado de erros
 */
export function useErrorHandler() {
  const { toast } = useToast();

  // Handler básico que mostra toast de erro
  const handleError = useCallback(
    createErrorHandler((params) => toast({ ...params, variant: 'destructive' })),
    [toast]
  );

  // Handler que retorna informações do erro processado (útil para forms)
  const processError = useCallback((error: unknown) => {
    return parseApiError(error);
  }, []);

  // Handler que mostra toast de sucesso
  const handleSuccess = useCallback((message: string) => {
    toast({
      title: 'Sucesso',
      description: message,
    });
  }, [toast]);

  // Handler para erros de validação específicos (útil para destacar campos)
  const handleValidationError = useCallback((error: unknown) => {
    const processed = parseApiError(error);
    
    // Se tem erros de validação, retorna eles para o componente usar
    if (processed.validationErrors) {
      return {
        hasValidationErrors: true,
        validationErrors: processed.validationErrors,
        generalError: null
      };
    }
    
    // Se não tem erros de validação, mostra toast geral
    toast({
      title: processed.title,
      description: processed.message,
      variant: 'destructive'
    });
    
    return {
      hasValidationErrors: false,
      validationErrors: null,
      generalError: processed.message
    };
  }, [toast]);

  // Handler para operações assíncronas com loading
  const withErrorHandling = useCallback(<T,>(
    asyncFn: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorTitle?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
    }
  ) => {
    return async (): Promise<{ success: boolean; data?: T; error?: string }> => {
      try {
        const result = await asyncFn();
        
        if (options?.successMessage) {
          handleSuccess(options.successMessage);
        }
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        
        return { success: true, data: result };
      } catch (error) {
        const processed = parseApiError(error);
        
        toast({
          title: options?.errorTitle || processed.title,
          description: processed.message,
          variant: 'destructive'
        });
        
        if (options?.onError) {
          options.onError(error);
        }
        
        return { success: false, error: processed.message };
      }
    };
  }, [toast, handleSuccess]);

  return {
    handleError,
    processError,
    handleSuccess,
    handleValidationError,
    withErrorHandling
  };
}

/**
 * Hook específico para operações de API com estados de loading
 */
export function useApiOperation<T = void>() {
  const { toast } = useToast();
  const { handleError, handleSuccess } = useErrorHandler();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
    }
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const result = await operation();
      
      if (options?.successMessage) {
        handleSuccess(options.successMessage);
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (error) {
      if (options?.onError) {
        options.onError(error);
      } else {
        handleError(error);
      }
      
      const processed = parseApiError(error);
      return { success: false, error: processed.message };
    }
  }, [handleError, handleSuccess]);

  return { execute };
}

/**
 * Hook para formulários com validação
 */
export function useFormErrorHandler() {
  const { toast } = useToast();

  const handleFormError = useCallback((error: unknown, setFieldErrors?: (errors: Record<string, string>) => void) => {
    const processed = parseApiError(error);
    
    // Se tem erros de validação e há função para definir erros de campo
    if (processed.validationErrors && setFieldErrors) {
      setFieldErrors(processed.validationErrors);
      
      toast({
        title: processed.title,
        description: 'Por favor, corrija os campos destacados',
        variant: 'destructive'
      });
    } else {
      // Mostra toast com erro geral
      toast({
        title: processed.title,
        description: processed.message,
        variant: 'destructive'
      });
    }
    
    return processed;
  }, [toast]);

  const clearFormErrors = useCallback((setFieldErrors?: (errors: Record<string, string>) => void) => {
    if (setFieldErrors) {
      setFieldErrors({});
    }
  }, []);

  return {
    handleFormError,
    clearFormErrors
  };
}

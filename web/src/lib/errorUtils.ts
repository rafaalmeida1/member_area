import { AxiosError } from 'axios';
import { ApiResponse } from '@/services/api';

/**
 * Interface para erros de validação do backend
 */
export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Interface para erro processado
 */
export interface ProcessedError {
  title: string;
  message: string;
  validationErrors?: ValidationErrors;
  statusCode?: number;
  type: 'validation' | 'business' | 'auth' | 'network' | 'unknown';
}

/**
 * Processa erros da API e retorna um formato padronizado
 */
export function parseApiError(error: unknown): ProcessedError {
  // Se é um AxiosError (erro da requisição HTTP)
  if (error instanceof Error && 'isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError<ApiResponse<ValidationErrors>>;
    
    // Erro de rede (sem resposta do servidor)
    if (!axiosError.response) {
      return {
        title: 'Erro de Conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        type: 'network'
      };
    }

    const { status, data } = axiosError.response;
    
    // Erro de autenticação
    if (status === 401) {
      return {
        title: 'Erro de Autenticação',
        message: data?.message || 'Credenciais inválidas ou sessão expirada',
        statusCode: status,
        type: 'auth'
      };
    }
    
    // Erro de autorização
    if (status === 403) {
      return {
        title: 'Acesso Negado',
        message: data?.message || 'Você não tem permissão para realizar esta ação',
        statusCode: status,
        type: 'auth'
      };
    }
    
    // Erro de validação (400 com dados de validação)
    if (status === 400 && data?.data && typeof data.data === 'object') {
      const validationErrors = data.data as ValidationErrors;
      
      // Se há erros de validação específicos
      if (Object.keys(validationErrors).length > 0) {
        return {
          title: 'Dados Inválidos',
          message: data.message || 'Por favor, corrija os campos destacados',
          validationErrors,
          statusCode: status,
          type: 'validation'
        };
      }
    }
    
    // Erro de negócio (400 sem dados de validação)
    if (status === 400) {
      return {
        title: 'Erro na Operação',
        message: data?.message || 'Dados de entrada inválidos',
        statusCode: status,
        type: 'business'
      };
    }
    
    // Erro interno do servidor
    if (status >= 500) {
      return {
        title: 'Erro Interno',
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
        statusCode: status,
        type: 'unknown'
      };
    }
    
    // Outros erros HTTP
    return {
      title: 'Erro na Requisição',
      message: data?.message || `Erro ${status}`,
      statusCode: status,
      type: 'unknown'
    };
  }
  
  // Se é um Error comum do JavaScript
  if (error instanceof Error) {
    return {
      title: 'Erro',
      message: error.message,
      type: 'business'
    };
  }
  
  // Erro desconhecido
  return {
    title: 'Erro Desconhecido',
    message: 'Ocorreu um erro inesperado',
    type: 'unknown'
  };
}

/**
 * Formata mensagens de erro de validação para exibição
 */
export function formatValidationErrors(errors: ValidationErrors): string {
  const messages = Object.entries(errors).map(([field, message]) => {
    const fieldName = getFieldDisplayName(field);
    return `${fieldName}: ${message}`;
  });
  
  return messages.join('\n');
}

/**
 * Converte nomes de campos do backend para nomes amigáveis
 */
function getFieldDisplayName(field: string): string {
  const fieldMap: Record<string, string> = {
    // Auth fields
    email: 'Email',
    password: 'Senha',
    name: 'Nome',
    phone: 'Telefone',
    currentPassword: 'Senha atual',
    newPassword: 'Nova senha',
    
    // Module fields
    title: 'Título',
    description: 'Descrição',
    category: 'Categoria',
    content: 'Conteúdo',
    coverImage: 'Imagem de capa',
    visibility: 'Visibilidade',
    
    // Link fields
    url: 'URL',
    linkType: 'Tipo do link',
    
    // Profile fields
    bio: 'Biografia',
    specialties: 'Especialidades',
    
    // Invite fields
    expirationDays: 'Dias para expiração',
    
    // Content block fields
    type: 'Tipo',
    order: 'Ordem',
    
    // Media fields
    file: 'Arquivo',
    
    // Date fields
    birthDate: 'Data de nascimento',
    startDate: 'Data inicial',
    endDate: 'Data final',
  };
  
  return fieldMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Valida email no frontend
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email é obrigatório';
  }
  
  if (!email.trim()) {
    return 'Email não pode estar vazio';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email deve ter um formato válido';
  }
  
  return null;
}

/**
 * Valida senha no frontend
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Senha é obrigatória';
  }
  
  if (password.length < 8) {
    return 'Senha deve ter pelo menos 8 caracteres';
  }
  
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
    return 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial';
  }
  
  return null;
}

/**
 * Valida nome no frontend
 */
export function validateName(name: string): string | null {
  if (!name) {
    return 'Nome é obrigatório';
  }
  
  if (!name.trim()) {
    return 'Nome não pode estar vazio';
  }
  
  if (name.trim().length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres';
  }
  
  if (name.trim().length > 255) {
    return 'Nome deve ter no máximo 255 caracteres';
  }
  
  return null;
}

/**
 * Valida URL no frontend
 */
export function validateUrl(url: string): string | null {
  if (!url) {
    return 'URL é obrigatória';
  }
  
  if (!url.trim()) {
    return 'URL não pode estar vazia';
  }
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL deve ter um formato válido';
  }
}

/**
 * Valida campo obrigatório no frontend
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} é obrigatório`;
  }
  
  return null;
}

/**
 * Valida número positivo
 */
export function validatePositiveNumber(value: number, fieldName: string): string | null {
  if (!value || value <= 0) {
    return `${fieldName} deve ser um número positivo`;
  }
  
  return null;
}

/**
 * Cria um hook para mostrar erros no toast
 */
export function createErrorHandler(showToast: (params: { title: string; description: string; variant?: 'destructive' }) => void) {
  return (error: unknown) => {
    const parsed = parseApiError(error);
    
    showToast({
      title: parsed.title,
      description: parsed.validationErrors 
        ? formatValidationErrors(parsed.validationErrors)
        : parsed.message,
      variant: 'destructive'
    });
  };
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export das funções de tratamento de erro para compatibilidade
export { 
  parseApiError,
  formatValidationErrors,
  validateEmail,
  validatePassword,
  validateName,
  validateUrl,
  validateRequired,
  validatePositiveNumber,
  createErrorHandler,
  type ProcessedError,
  type ValidationErrors
} from './errorUtils';

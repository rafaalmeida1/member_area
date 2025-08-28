import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Padroniza parsing de erros vindos do backend (ApiResponse)
export function parseApiError(err: unknown): {
  title: string;
  description: string;
  fieldErrors?: Record<string, string>;
} {
  // Axios error shape
  const anyErr = err as any;
  const res = anyErr?.response;
  const data = res?.data;

  // ApiResponse esperado: { status, message, data }
  const statusText = data?.status || res?.status?.toString() || 'error';
  const message = data?.message || anyErr?.message || 'Ocorreu um erro';
  const fieldErrors = (data?.data && typeof data?.data === 'object') ? data.data : undefined;

  return {
    title: statusText === 'error' ? 'Erro' : statusText,
    description: fieldErrors ? formatFieldErrors(fieldErrors) : message,
    fieldErrors: fieldErrors,
  };
}

function formatFieldErrors(errors: Record<string, string>): string {
  const entries = Object.entries(errors);
  if (entries.length === 0) return 'Dados inválidos';
  // Junta como: campo: mensagem
  return entries.map(([field, msg]) => `${field}: ${msg}`).join(' | ');
}

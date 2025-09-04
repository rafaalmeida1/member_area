import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Função para criar instância axios com interceptors padronizados
export function createApiInstance(requireAuth = true): AxiosInstance {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (requireAuth) {
    // Interceptor para adicionar token
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar respostas de erro
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          url: error.config?.url,
          method: error.config?.method
        });

        // Se o token está inválido/expirado, limpar localStorage
        if (error.response?.status === 401) {
          console.warn('Token inválido ou expirado, limpando localStorage...');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          
          // Se não estamos na página de login, redirecionar
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  return api;
}

// Instâncias pré-configuradas
export const publicApi = createApiInstance(false);  // Sem autenticação
export const privateApi = createApiInstance(true);  // Com autenticação

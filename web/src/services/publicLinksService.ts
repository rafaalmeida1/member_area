import axios from 'axios';
import { PublicLinksData, LinkRequest, LinkResponse, ReorderLinksRequest } from '@/types/publicLinks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Cliente axios sem autenticação para rotas públicas
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente axios com autenticação para rotas privadas
const privateApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nas requisições privadas
privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('PublicLinksService: Token encontrado?', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas de erro
privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log do erro para debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method
    });

    // Se token expirou, limpar localStorage mas NÃO redirecionar automaticamente
    if (error.response?.status === 401) {
      console.log('PublicLinksService: Token expirado, limpando localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Não redirecionar automaticamente - deixar o componente tratar
    }

    return Promise.reject(error);
  }
);

// Interceptor para API pública também
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Public API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method
    });

    return Promise.reject(error);
  }
);

export const publicLinksService = {
  // Rotas públicas
  async getPublicLinks(professionalId: number): Promise<PublicLinksData> {
    if (!professionalId || professionalId <= 0) {
      throw new Error('ID do profissional inválido');
    }
    
    const response = await publicApi.get(`/api/public/links/${professionalId}`);
    
    if (!response.data) {
      throw new Error('Dados não encontrados');
    }
    
    return response.data;
  },

  async trackLinkClick(linkId: number): Promise<void> {
    if (!linkId || linkId <= 0) {
      throw new Error('ID do link inválido');
    }
    
    await publicApi.post(`/api/public/links/${linkId}/click`);
  },

  // Rotas privadas (para profissionais)
  async getAllLinks(): Promise<LinkResponse[]> {
    const response = await privateApi.get('/api/professional/links');
    return response.data;
  },

  async createLink(request: LinkRequest): Promise<LinkResponse> {
    if (!request.title?.trim()) {
      throw new Error('Título é obrigatório');
    }
    
    if (!request.url?.trim()) {
      throw new Error('URL é obrigatória');
    }
    
    if (!request.linkType) {
      throw new Error('Tipo do link é obrigatório');
    }
    
    const response = await privateApi.post('/api/professional/links', request);
    return response.data;
  },

  async updateLink(linkId: number, request: LinkRequest): Promise<LinkResponse> {
    if (!linkId || linkId <= 0) {
      throw new Error('ID do link inválido');
    }
    
    if (!request.title?.trim()) {
      throw new Error('Título é obrigatório');
    }
    
    if (!request.url?.trim()) {
      throw new Error('URL é obrigatória');
    }
    
    if (!request.linkType) {
      throw new Error('Tipo do link é obrigatório');
    }
    
    const response = await privateApi.put(`/api/professional/links/${linkId}`, request);
    return response.data;
  },

  async deleteLink(linkId: number): Promise<void> {
    if (!linkId || linkId <= 0) {
      throw new Error('ID do link inválido');
    }
    
    await privateApi.delete(`/api/professional/links/${linkId}`);
  },

  async reorderLinks(request: ReorderLinksRequest): Promise<void> {
    if (!request.linkIds || !Array.isArray(request.linkIds) || request.linkIds.length === 0) {
      throw new Error('Lista de IDs inválida');
    }
    
    if (request.linkIds.some(id => !id || id <= 0)) {
      throw new Error('IDs de links inválidos');
    }
    
    await privateApi.put('/api/professional/links/reorder', request);
  },
};

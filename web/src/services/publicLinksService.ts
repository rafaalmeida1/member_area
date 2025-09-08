import { publicApi, privateApi } from './apiConfig';
import { PublicLinksData, LinkRequest, LinkResponse, ReorderLinksRequest } from '@/types/publicLinks';
import { ApiResponse } from './api';
import { validateRequired, validateUrl, validatePositiveNumber } from '@/lib/errorUtils';

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
    const idError = validatePositiveNumber(professionalId, 'ID do profissional');
    if (idError) throw new Error(idError);
    
    const response = await publicApi.get<ApiResponse<PublicLinksData>>(
      `/api/public/links/${professionalId}`
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Dados do profissional não encontrados');
  },

  async trackLinkClick(linkId: number): Promise<void> {
    const idError = validatePositiveNumber(linkId, 'ID do link');
    if (idError) throw new Error(idError);
    
    const response = await publicApi.post<ApiResponse<void>>(
      `/api/public/links/${linkId}/click`
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao registrar clique no link');
    }
  },

  // Rotas privadas (para profissionais)
  async getAllLinks(): Promise<LinkResponse[]> {
    const response = await privateApi.get<ApiResponse<LinkResponse[]>>(
      '/api/professional/links'
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar links');
  },

  async createLink(request: LinkRequest): Promise<LinkResponse> {
    // Validações client-side
    const titleError = validateRequired(request.title, 'Título');
    if (titleError) throw new Error(titleError);
    
    const urlError = validateUrl(request.url);
    if (urlError) throw new Error(urlError);
    
    const typeError = validateRequired(request.linkType, 'Tipo do link');
    if (typeError) throw new Error(typeError);
    
    const response = await privateApi.post<ApiResponse<LinkResponse>>(
      '/api/professional/links', 
      request
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao criar link');
  },

  async updateLink(linkId: number, request: LinkRequest): Promise<LinkResponse> {
    // Validações client-side
    const idError = validatePositiveNumber(linkId, 'ID do link');
    if (idError) throw new Error(idError);
    
    const titleError = validateRequired(request.title, 'Título');
    if (titleError) throw new Error(titleError);
    
    const urlError = validateUrl(request.url);
    if (urlError) throw new Error(urlError);
    
    const typeError = validateRequired(request.linkType, 'Tipo do link');
    if (typeError) throw new Error(typeError);
    
    const response = await privateApi.put<ApiResponse<LinkResponse>>(
      `/api/professional/links/${linkId}`, 
      request
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao atualizar link');
  },

  async deleteLink(linkId: number): Promise<void> {
    const idError = validatePositiveNumber(linkId, 'ID do link');
    if (idError) throw new Error(idError);
    
    const response = await privateApi.delete<ApiResponse<void>>(
      `/api/professional/links/${linkId}`
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao deletar link');
    }
  },

  async reorderLinks(request: ReorderLinksRequest): Promise<void> {
    if (!request.linkIds || !Array.isArray(request.linkIds) || request.linkIds.length === 0) {
      throw new Error('Lista de IDs é obrigatória');
    }
    
    for (const id of request.linkIds) {
      const idError = validatePositiveNumber(id, 'ID do link');
      if (idError) throw new Error(idError);
    }
    
    const response = await privateApi.put<ApiResponse<void>>(
      '/api/professional/links/reorder', 
      request
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao reordenar links');
    }
  },
};

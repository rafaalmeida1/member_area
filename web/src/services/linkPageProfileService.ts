import { privateApi } from './apiConfig';
import { LinkPageProfileRequest, LinkPageProfileResponse } from '@/types/linkPageProfile';
import { ApiResponse } from './api';
import { validateRequired } from '@/lib/errorUtils';

export const linkPageProfileService = {
  async getLinkPageProfile(): Promise<LinkPageProfileResponse> {
    const response = await privateApi.get<ApiResponse<LinkPageProfileResponse>>(
      '/api/professional/link-page-profile'
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar perfil da página de links');
  },

  async updateLinkPageProfile(request: LinkPageProfileRequest): Promise<LinkPageProfileResponse> {
    // Validações client-side
    if (request.displayTitle) {
      const titleError = validateRequired(request.displayTitle, 'Título');
      if (titleError) throw new Error(titleError);
    }
    
    if (request.displayBio) {
      const descError = validateRequired(request.displayBio, 'Descrição');
      if (descError) throw new Error(descError);
    }
    
    const response = await privateApi.put<ApiResponse<LinkPageProfileResponse>>(
      '/api/professional/link-page-profile', 
      request
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao atualizar perfil da página de links');
  },

};

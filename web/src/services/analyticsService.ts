import { privateApi } from './apiConfig';
import { PageAnalytics, LinkAnalytics } from '@/types/analytics';
import { ApiResponse } from './api';

export const analyticsService = {
  async getPageAnalytics(startDate?: string, endDate?: string): Promise<PageAnalytics> {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('Data inicial deve ser anterior à data final');
    }
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await privateApi.get<ApiResponse<PageAnalytics>>(
      `/professional/analytics/page?${params.toString()}`
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar analytics da página');
  },

  async getLinkAnalytics(linkId: number, startDate?: string, endDate?: string): Promise<LinkAnalytics> {
    if (!linkId || linkId <= 0) {
      throw new Error('ID do link é obrigatório e deve ser válido');
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('Data inicial deve ser anterior à data final');
    }
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await privateApi.get<ApiResponse<LinkAnalytics>>(
      `/professional/analytics/link/${linkId}?${params.toString()}`
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar analytics do link');
  },
};

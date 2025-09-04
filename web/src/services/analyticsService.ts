import { privateApi } from './apiConfig';
import { PageAnalytics, LinkAnalytics } from '@/types/analytics';

export const analyticsService = {
  async getPageAnalytics(startDate?: string, endDate?: string): Promise<PageAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await privateApi.get(`/professional/analytics/page?${params.toString()}`);
    return response.data;
  },

  async getLinkAnalytics(linkId: number, startDate?: string, endDate?: string): Promise<LinkAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await privateApi.get(`/professional/analytics/link/${linkId}?${params.toString()}`);
    return response.data;
  },
};

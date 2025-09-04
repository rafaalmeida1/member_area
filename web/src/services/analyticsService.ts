import axios from 'axios';
import { PageAnalytics, LinkAnalytics } from '@/types/analytics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyticsService = {
  async getPageAnalytics(startDate?: string, endDate?: string): Promise<PageAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/api/professional/analytics/page?${params.toString()}`);
    return response.data;
  },

  async getLinkAnalytics(linkId: number, startDate?: string, endDate?: string): Promise<LinkAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/api/professional/analytics/link/${linkId}?${params.toString()}`);
    return response.data;
  },
};

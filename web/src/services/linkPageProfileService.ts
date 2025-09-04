import axios from 'axios';
import { LinkPageProfileRequest, LinkPageProfileResponse } from '@/types/linkPageProfile';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('LinkPageProfile API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method
    });

    return Promise.reject(error);
  }
);

export const linkPageProfileService = {
  async getLinkPageProfile(): Promise<LinkPageProfileResponse> {
    const response = await api.get('/api/professional/link-page-profile');
    return response.data;
  },

  async updateLinkPageProfile(request: LinkPageProfileRequest): Promise<LinkPageProfileResponse> {
    const response = await api.put('/api/professional/link-page-profile', request);
    return response.data;
  },

  async copySiteColors(): Promise<void> {
    await api.post('/api/professional/link-page-profile/copy-site-colors');
  },
};

import { privateApi } from './apiConfig';
import { ApiResponse } from './api';

export interface ProfessionalInfo {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  image?: string;
  backgroundImage?: string;
}

export interface DashboardStats {
  // Estatísticas para profissionais
  totalPatients?: number;
  activePatients?: number;
  totalModules?: number;
  activeModules?: number;
  totalInvites?: number;
  invitesThisMonth?: number;
  totalViews?: number;
  
  // Estatísticas para pacientes
  viewedModules?: number;
  completedModules?: number;
  totalStudyTime?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  viewCount: number;
  completionRate: number;
  isActive: boolean;
  duration?: string;
  level?: string;
  category?: string;
  visibility?: string;
  coverImage?: string;
}

class DashboardService {
  /**
   * Busca informações do profissional
   */
  async getProfessionalInfo(): Promise<ProfessionalInfo> {
    const response = await privateApi.get<ApiResponse<ProfessionalInfo>>('/dashboard/professional-info');
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar informações profissionais');
  }

  /**
   * Busca estatísticas do dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await privateApi.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar estatísticas');
  }

  /**
   * Busca módulos para o dashboard
   */
  async getModules(): Promise<Module[]> {
    const response = await privateApi.get<ApiResponse<Module[]>>('/dashboard/modules');
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar módulos');
  }
}

export const dashboardService = new DashboardService();

import { privateApi } from './apiConfig';
import { ApiResponse } from './api';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  moduleId?: string;
  moduleTitle?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

class NotificationService {
  /**
   * Busca notificações do usuário
   */
  async getNotifications(): Promise<Notification[]> {
    const response = await privateApi.get<ApiResponse<Notification[]>>('/notifications');
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar notificações');
  }

  /**
   * Busca notificações não lidas
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await privateApi.get<ApiResponse<Notification[]>>('/notifications/unread');
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar notificações não lidas');
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await privateApi.get<ApiResponse<number>>('/notifications/unread-count');
    
    if (response.data.status === 'success' && response.data.data !== undefined) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar contador de notificações');
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: number): Promise<void> {
    const response = await privateApi.put<ApiResponse<void>>(`/notifications/${notificationId}/read`);
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao marcar notificação como lida');
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    const response = await privateApi.put<ApiResponse<void>>('/notifications/read-all');
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Erro ao marcar todas as notificações como lidas');
    }
  }
}

export const notificationService = new NotificationService();

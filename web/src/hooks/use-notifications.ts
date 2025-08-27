import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: number;
  type: 'MODULE_NEW' | 'MODULE_UPDATED' | 'PROFESSIONAL_MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  moduleId?: number;
  moduleTitle?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Carregar notificações
  const loadNotifications = useCallback(async (showLoading = false) => {
    if (!user) return;
    
    try {
      if (showLoading) setIsLoading(true);
      const response = await apiService.getNotifications();
      setNotifications(response);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      if (showLoading) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as notificações.",
          variant: "destructive",
        });
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [user, toast]);

  // Carregar contador de notificações não lidas
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const count = await apiService.getUnreadNotificationsCount();
      // Atualizar apenas o contador sem recarregar todas as notificações
      setNotifications(prev => {
        const currentUnreadCount = prev.filter(n => !n.read).length;
        if (currentUnreadCount !== count) {
          // Se o contador mudou, recarregar as notificações
          loadNotifications();
        }
        return prev;
      });
    } catch (error) {
      console.error('Erro ao carregar contador de notificações:', error);
    }
  }, [user, loadNotifications]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [toast]);

  // Carregar notificações quando o usuário faz login
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setLastUpdate(null);
    }
  }, [user, loadNotifications]);

  // Atualização periódica das notificações (a cada 30 segundos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    lastUpdate,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
  };
} 
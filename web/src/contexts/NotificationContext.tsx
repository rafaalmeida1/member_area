import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationService, Notification as NotificationType } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

// Usar o tipo do serviço
type Notification = NotificationType;

interface NotificationContextType {
  // Estados
  notifications: Notification[];
  allNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  actionLoading: number | null;
  markAllLoading: boolean;
  
  // Estados para paginação
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLoadingMore: boolean;
  hasMore: boolean;
  
  // Ações
  loadUnreadNotifications: () => Promise<void>;
  loadAllNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Utilitários
  getNotificationIcon: (type: Notification['type']) => React.ReactNode;
  getNotificationColor: (type: Notification['type']) => string;
  formatTime: (dateString: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Estados
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar notificações não lidas
  const loadUnreadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const unreadNotifications = await notificationService.getUnreadNotifications();
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Erro ao carregar notificações não lidas:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações não lidas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Carregar todas as notificações
  const loadAllNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const allNotifications = await notificationService.getNotifications();
      setAllNotifications(allNotifications);
    } catch (error) {
      console.error('Erro ao carregar todas as notificações:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar todas as notificações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      setActionLoading(notificationId);
      await notificationService.markAsRead(notificationId);
      
      // Atualizar estado local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setAllNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }, [toast]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      setMarkAllLoading(true);
      await notificationService.markAllAsRead();
      
      // Atualizar estado local
      setNotifications([]);
      setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas.",
        variant: "destructive",
      });
    } finally {
      setMarkAllLoading(false);
    }
  }, [toast]);

  // Atualizar notificações (recarregar)
  const refreshNotifications = useCallback(async () => {
    await Promise.all([
      loadUnreadNotifications(),
      loadAllNotifications()
    ]);
  }, [loadUnreadNotifications, loadAllNotifications]);

  // Utilitários
  const getNotificationIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'MODULE_NEW':
        return '📚'; // BookOpen
      case 'MODULE_UPDATED':
        return '🔄'; // RefreshCw
      case 'PROFESSIONAL_MESSAGE':
        return '💬'; // MessageSquare
      case 'SYSTEM':
        return '⚙️'; // Settings
      default:
        return '🔔'; // Bell
    }
  }, []);

  const getNotificationColor = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'MODULE_NEW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MODULE_UPDATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROFESSIONAL_MESSAGE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SYSTEM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  }, []);

  // Carregar notificações automaticamente quando o usuário fizer login
  useEffect(() => {
    if (user) {
      // Carregar notificações não lidas imediatamente
      loadUnreadNotifications();
      
      // Configurar polling para atualizar notificações a cada 30 segundos
      const interval = setInterval(() => {
        loadUnreadNotifications();
      }, 30000); // 30 segundos
      
      return () => clearInterval(interval);
    } else {
      // Limpar notificações quando o usuário sair
      setNotifications([]);
      setAllNotifications([]);
      setUnreadCount(0);
    }
  }, [user, loadUnreadNotifications]);

  const value: NotificationContextType = {
    // Estados
    notifications,
    allNotifications,
    unreadCount,
    isLoading,
    actionLoading,
    markAllLoading,
    
    // Estados para paginação
    currentPage,
    totalPages,
    totalElements,
    isLoadingMore,
    hasMore,
    
    // Ações
    loadUnreadNotifications,
    loadAllNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    
    // Utilitários
    getNotificationIcon,
    getNotificationColor,
    formatTime,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
}

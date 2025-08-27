"use client"

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ExternalLink, BookOpen, RefreshCw, MessageSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  type: 'MODULE_NEW' | 'MODULE_UPDATED' | 'PROFESSIONAL_MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  moduleId?: number;
  moduleTitle?: string;
}

interface AllNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (moduleId: number) => void;
}

export function AllNotificationsModal({ isOpen, onClose, onNavigateToModule }: AllNotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const pageSize = 20;

  // Debug log
  console.log('AllNotificationsModal renderizado, isOpen:', isOpen);

  // Carregar notificações
  const loadNotifications = async (page: number = 0) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getAllNotifications(page, pageSize);
      setNotifications(response.notifications);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      console.log('Notificações carregadas:', response.notifications.length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar notificações quando o modal abre
  useEffect(() => {
    if (isOpen && user) {
      loadNotifications(0);
      setCurrentPage(0);
    }
  }, [isOpen, user]);

  // Marcar como lida
  const handleMarkAsRead = async (notificationId: number) => {
    setActionLoading(notificationId);
    try {
      await apiService.markNotificationAsRead(notificationId);
      // Atualizar a notificação local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida.",
      });
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
  };

  // Navegar para módulo
  const handleModuleClick = async (notification: Notification) => {
    if (notification.moduleId && onNavigateToModule) {
      setActionLoading(notification.id);
      try {
        await apiService.markNotificationAsRead(notification.id);
        onNavigateToModule(notification.moduleId);
        onClose();
      } catch (error) {
        console.error('Erro ao navegar para módulo:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Mudar página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      loadNotifications(newPage);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MODULE_NEW':
        return <BookOpen className="size-4 text-emerald-500" />;
      case 'MODULE_UPDATED':
        return <RefreshCw className="size-4 text-blue-500" />;
      case 'PROFESSIONAL_MESSAGE':
        return <MessageSquare className="size-4 text-purple-500" />;
      case 'SYSTEM':
        return <Settings className="size-4 text-amber-500" />;
      default:
        return <Bell className="size-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
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
  };

  const formatTime = (dateString: string) => {
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
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--background)',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '56rem',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold">Todas as Notificações</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalElements} notificação{totalElements !== 1 ? 's' : ''} no total
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
              <p className="text-sm text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="size-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      !notification.read ? 'bg-accent/50 border-primary/20' : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Avatar className="size-10 bg-muted">
                        <AvatarFallback className={`text-sm ${getNotificationColor(notification.type)}`}>
                          {actionLoading === notification.id ? (
                            <div className="size-4 animate-spin rounded-full border border-current border-t-transparent" />
                          ) : (
                            getNotificationIcon(notification.type)
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className={`text-base font-medium ${
                                !notification.read ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                Não lida
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-muted-foreground font-medium">
                              {formatTime(notification.createdAt)}
                            </p>
                            {notification.moduleId && (
                              <span className="text-xs text-primary flex items-center gap-1 font-medium">
                                {notification.moduleTitle}
                                <ExternalLink className="size-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={actionLoading === notification.id}
                              className="text-xs"
                            >
                              {actionLoading === notification.id ? (
                                <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                              ) : (
                                "Marcar como lida"
                              )}
                            </Button>
                          )}
                          {notification.moduleId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleModuleClick(notification)}
                              disabled={actionLoading === notification.id}
                              className="text-xs"
                            >
                              {actionLoading === notification.id ? (
                                <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                              ) : (
                                "Abrir módulo"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t">
            <p className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Próxima
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
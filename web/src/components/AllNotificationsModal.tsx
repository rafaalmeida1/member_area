import React, { useState, useEffect } from 'react';
import { useNotificationDrawer } from '@/contexts/NotificationDrawerContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { apiService, Notification } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Bell, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AllNotificationsModal() {
  const { isModalOpen, closeModal, onNavigateToModule } = useNotificationDrawer();
  const { toast } = useToast();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (isModalOpen) {
      loadAllNotifications(0);
    }
  }, [isModalOpen]);

  const loadAllNotifications = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllNotifications(page, pageSize);
      setAllNotifications(response.notifications);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToModule = (moduleId: string) => {
    if (onNavigateToModule) {
      onNavigateToModule(moduleId);
      closeModal();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MODULE_AVAILABLE':
        return <Info className="w-4 h-4" />;
      case 'MODULE_COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REMINDER':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Todas as Notificações</h2>
            <Badge variant="secondary">{totalElements}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={closeModal}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando...</span>
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.isRead 
                      ? 'bg-muted/50' 
                      : 'bg-background border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {getNotificationIcon(notification.type)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatDate(notification.createdAt)}
                        </div>
                      </div>
                      
                      {notification.moduleId && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-primary hover:text-primary/80"
                          onClick={() => handleNavigateToModule(notification.moduleId!)}
                        >
                          Ver módulo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAllNotifications(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAllNotifications(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
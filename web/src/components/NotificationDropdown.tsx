"use client"

import React, { useState, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useNotificationDrawer } from '@/contexts/NotificationDrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Clock, CheckCircle, AlertCircle, Info, CheckCheck, BookOpen, RefreshCw, MessageSquare, Settings, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/hooks/use-notifications';
import './NotificationDropdown.css';

export function NotificationDropdown() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    lastUpdate,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationContext();
  const { openModal, setOnNavigateToModule } = useNotificationDrawer();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  // Carregar notificações quando abrir o dropdown (apenas se não foram carregadas recentemente)
  useEffect(() => {
    if (isOpen && user) {
      const shouldReload = !lastUpdate || (new Date().getTime() - lastUpdate.getTime()) > 60000; // 1 minuto
      if (shouldReload) {
        loadNotifications(true);
      }
    }
  }, [isOpen, user, lastUpdate, loadNotifications]);

  const handleOpenAllNotifications = () => {
    setOnNavigateToModule((moduleId: string) => {
      // Navegar para o módulo
      window.location.href = `/module/${moduleId}`;
    });
    openModal();
    setIsOpen(false);
  };

  // Navegar para módulo
  const handleModuleClick = async (notification: Notification) => {
    if (notification.moduleId) {
      setActionLoading(notification.id);
      try {
        await markAsRead(notification.id);
        navigate(`/module/${notification.moduleId}`);
        setIsOpen(false);
      } catch (error) {
        console.error('Erro ao navegar para módulo:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Marcar notificação como lida com loading
  const handleMarkAsRead = async (notificationId: number) => {
    setActionLoading(notificationId);
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Marcar todas como lidas com loading
  const handleMarkAllAsRead = async () => {
    setMarkAllLoading(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    } finally {
      setMarkAllLoading(false);
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllLoading}
                className="h-6 px-2 text-xs"
              >
                {markAllLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                ) : (
                  <CheckCheck className="w-3 h-3" />
                )}
                Marcar todas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadNotifications(true)}
              disabled={isLoading}
              className="h-6 px-2 text-xs"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm">Carregando...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={() => handleModuleClick(notification)}
                >
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
                    
                    {!notification.read && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={actionLoading === notification.id}
                          className="h-6 px-2 text-xs"
                        >
                          {actionLoading === notification.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Marcar como lida
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="justify-center text-sm text-muted-foreground hover:text-foreground"
          onClick={handleOpenAllNotifications}
        >
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
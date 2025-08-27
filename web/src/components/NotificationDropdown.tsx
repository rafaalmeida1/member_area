"use client"

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ExternalLink, BookOpen, RefreshCw, MessageSquare, Settings } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface NotificationDropdownProps {
  onNavigateToModule?: (moduleId: number) => void;
}

export function NotificationDropdown({ onNavigateToModule }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  // Carregar notificações quando abrir o dropdown (apenas se não foram carregadas recentemente)
  useEffect(() => {
    if (isOpen && user) {
      const shouldReload = !lastUpdate || (new Date().getTime() - lastUpdate.getTime()) > 60000; // 1 minuto
      if (shouldReload) {
        loadNotifications(true);
      }
    }
  }, [isOpen, user, lastUpdate, loadNotifications]);

  // Navegar para módulo
  const handleModuleClick = (notification: Notification) => {
    if (notification.moduleId && onNavigateToModule) {
      onNavigateToModule(notification.moduleId);
      markAsRead(notification.id);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MODULE_NEW':
        return <BookOpen className="size-5 text-emerald-600" />;
      case 'MODULE_UPDATED':
        return <RefreshCw className="size-5 text-blue-600" />;
      case 'PROFESSIONAL_MESSAGE':
        return <MessageSquare className="size-5 text-purple-600" />;
      case 'SYSTEM':
        return <Settings className="size-5 text-amber-600" />;
      default:
        return <Bell className="size-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'MODULE_NEW':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'MODULE_UPDATED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PROFESSIONAL_MESSAGE':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SYSTEM':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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
    });
  };

  // Se não há usuário logado, não mostrar o componente
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative h-10 w-10 border-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 size-6 flex items-center justify-center p-0 text-xs font-semibold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="p-0 text-lg font-semibold text-foreground">
            Notificações
          </DropdownMenuLabel>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-sm text-muted-foreground">
                Atualizado {formatTime(lastUpdate.toISOString())}
              </span>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 animate-spin rounded-full border-3 border-primary border-t-transparent mb-4" />
            <p className="text-sm text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="size-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-4 p-4 cursor-pointer group rounded-lg mb-2 hover:bg-accent transition-colors"
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Avatar className="size-12 bg-muted border-2">
                      <AvatarFallback className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-base font-semibold leading-tight mb-2 ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
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
                          <div className="size-3 bg-primary rounded-full flex-shrink-0" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notification.moduleId) {
                              handleModuleClick(notification);
                            } else {
                              markAsRead(notification.id);
                            }
                          }}
                        >
                          <Check className="size-4" />
                          <span className="sr-only">
                            {notification.moduleId ? "Abrir módulo" : "Marcar como lida"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="p-4 border-t">
          <DropdownMenuItem className="justify-center text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
            Ver todas as notificações
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
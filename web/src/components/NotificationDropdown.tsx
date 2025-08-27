"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, ExternalLink, BookOpen, RefreshCw, MessageSquare, Settings } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import './NotificationDropdown.css';

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

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Carregar notificações não lidas para o dropdown
  const loadUnreadNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications();
      const unreadNotifications = response.filter(n => !n.read);
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
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

  // Carregar todas as notificações para o sheet com paginação
  const loadAllNotifications = async (page: number = 0, append: boolean = false) => {
    if (!user) return;
    
    try {
      if (page === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await apiService.getNotificationsPaginated(page, 20);
      
      if (append) {
        setAllNotifications(prev => [...prev, ...response.content]);
      } else {
        setAllNotifications(response.content);
      }
      
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setHasMore(response.currentPage < response.totalPages - 1);
    } catch (error) {
      console.error('Erro ao carregar todas as notificações:', error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Função para carregar mais notificações (scroll infinito)
  const loadMoreNotifications = useCallback(async () => {
    if (hasMore && !isLoadingMore && !isLoading) {
      await loadAllNotifications(currentPage + 1, true);
    }
  }, [hasMore, isLoadingMore, isLoading, currentPage]);

  // Detectar scroll para carregar mais
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage > 0.8 && hasMore && !isLoadingMore) {
      loadMoreNotifications();
    }
  }, [hasMore, isLoadingMore, loadMoreNotifications]);

  // Carregar notificações quando abrir o dropdown
  useEffect(() => {
    if (isOpen && user) {
      loadUnreadNotifications();
    }
  }, [isOpen, user]);

  // Carregar todas as notificações quando abrir o sheet
  useEffect(() => {
    if (sheetOpen && user) {
      setCurrentPage(0);
      setHasMore(true);
      loadAllNotifications(0, false);
    }
  }, [sheetOpen, user]);

  // Marcar notificação como lida
  const markAsRead = async (notificationId: number) => {
    try {
      setActionLoading(notificationId);
      await apiService.markNotificationAsRead(notificationId);
      
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
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      setMarkAllLoading(true);
      await apiService.markAllNotificationsAsRead();
      
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
  };

  // Navegar para módulo
  const handleModuleClick = async (notification: Notification) => {
    if (notification.moduleId) {
      try {
        setActionLoading(notification.id);
        await markAsRead(notification.id);
        window.location.href = window.location.origin + `/module/${notification.moduleId}`;
        setIsOpen(false);
      } catch (error) {
        console.error('Erro ao navegar para módulo:', error);
      } finally {
        setActionLoading(null);
      }
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
    });
  };

  // Se não há usuário logado, não mostrar o componente
  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5 text-black" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">
              {unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 z-50">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex flex-col items-start gap-2">
              <DropdownMenuLabel className="p-0 text-base font-semibold">
                Notificações Não Lidas
              </DropdownMenuLabel>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={markAllLoading}
                  className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {markAllLoading ? (
                    <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    "Marcar todas como lidas"
                  )}
                </Button>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
              <p className="text-sm text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação não lida</p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3 cursor-pointer group"
                  onClick={() => !notification.read && handleModuleClick(notification)}
                  disabled={actionLoading === notification.id}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Avatar className="size-8 bg-muted">
                      <AvatarFallback className={`text-xs ${getNotificationColor(notification.type)}`}>
                        {actionLoading === notification.id ? (
                          <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          getNotificationIcon(notification.type)
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium leading-tight ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt)}
                          </p>
                          {notification.moduleId && (
                            <span className="text-xs text-primary flex items-center gap-1">
                              {notification.moduleTitle}
                              <ExternalLink className="size-3" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <div className="size-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notification.moduleId) {
                              handleModuleClick(notification);
                            } else {
                              markAsRead(notification.id);
                            }
                          }}
                          disabled={actionLoading === notification.id}
                        >
                          {actionLoading === notification.id ? (
                            <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                          ) : (
                            <Check className="size-3" />
                          )}
                          <span className="sr-only">
                            {notification.moduleId ? "Abrir módulo" : "Marcar como lida"}
                          </span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Botão para redirecionar para módulo no dropdown */}
                    {notification.moduleId && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModuleClick(notification);
                          }}
                          disabled={actionLoading === notification.id}
                          className="h-6 px-2 text-xs"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          Ver Módulo
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="justify-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSheetOpen(true);
              setIsOpen(false);
            }}
          >
            Ver todas as notificações
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sheet para todas as notificações */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-96 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Todas as Notificações</h2>
                <Badge variant="secondary">{totalElements}</Badge>
              </div>
            </div>

            {/* Content */}
            <ScrollArea 
              className="flex-1 p-4" 
              onScroll={handleScroll}
              ref={scrollAreaRef}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                  <p className="text-sm text-muted-foreground">Carregando notificações...</p>
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
                        notification.read 
                          ? 'bg-muted/50' 
                          : 'bg-background border-primary/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`text-xs ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(notification.createdAt)}
                                </p>
                                {notification.moduleId && (
                                  <span className="text-xs text-primary flex items-center gap-1">
                                    {notification.moduleTitle}
                                    <ExternalLink className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  disabled={actionLoading === notification.id}
                                  className="h-6 px-2 text-xs"
                                >
                                  {actionLoading === notification.id ? (
                                    <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Botão para redirecionar para módulo */}
                          {notification.moduleId && (
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!notification.read) {
                                    markAsRead(notification.id);
                                  }
                                  navigate(`/module/${notification.moduleId}`);
                                  setSheetOpen(false);
                                }}
                                disabled={actionLoading === notification.id}
                                className="h-7 px-3 text-xs"
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                Ver Módulo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading mais notificações */}
                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                      <span className="text-sm text-muted-foreground">Carregando mais...</span>
                    </div>
                  )}
                  
                  {/* Indicador de fim */}
                  {!hasMore && allNotifications.length > 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">Todas as notificações foram carregadas</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 
"use client"

import React, { useState, useRef } from 'react';
import { Bell, Check, ExternalLink, BookOpen, RefreshCw, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification as NotificationType } from '@/services/notificationService';
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
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import './NotificationDropdown.css';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Usar o contexto de notificações
  const {
    notifications,
    allNotifications,
    unreadCount,
    isLoading,
    actionLoading,
    markAllLoading,
    totalElements,
    isLoadingMore,
    hasMore,
    loadAllNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
    formatTime,
  } = useNotifications();

  // Detectar scroll para carregar mais (simplificado)
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    // Implementação simplificada sem paginação
  };

  // Carregar todas as notificações quando abrir o sheet
  React.useEffect(() => {
    if (sheetOpen && user) {
      loadAllNotifications();
    }
  }, [sheetOpen, user, loadAllNotifications]);

  // Navegar para módulo
  const handleModuleClick = async (notification: NotificationType) => {
    if (notification.moduleId) {
      try {
        await markAsRead(notification.id);
        window.location.href = window.location.origin + `/module/${notification.moduleId}`;
        setIsOpen(false);
      } catch (error) {
        console.error('Erro ao navegar para módulo:', error);
      }
    }
  };

  // Função para renderizar ícones com componentes Lucide
  const renderNotificationIcon = (type: NotificationType['type']) => {
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
                  className="flex items-start gap-3 p-3 cursor-pointer group border-[var(--color-border)] hover:bg-[var(--color-accent)]"
                  onClick={() => !notification.read && handleModuleClick(notification)}
                  disabled={actionLoading === notification.id}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Avatar className="size-8 bg-muted">
                      <AvatarFallback className={`text-xs ${getNotificationColor(notification.type)}`}>
                        {actionLoading === notification.id ? (
                          <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          renderNotificationIcon(notification.type)
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 border-[var(--color-border)]">
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
                          ? 'bg-[var(--color-muted)]/50 border-[var(--color-border)] hover:bg-[var(--color-accent)]' 
                          : 'bg-[var(--color-background)] border-[var(--color-border)] hover:bg-[var(--color-accent)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`text-xs ${getNotificationColor(notification.type)}`}>
                            {renderNotificationIcon(notification.type)}
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
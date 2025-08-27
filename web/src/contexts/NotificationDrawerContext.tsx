import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationDrawerContextType {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  onNavigateToModule?: (moduleId: number) => void;
  setOnNavigateToModule: (callback: (moduleId: number) => void) => void;
}

const NotificationDrawerContext = createContext<NotificationDrawerContextType | undefined>(undefined);

interface NotificationDrawerProviderProps {
  children: ReactNode;
}

export function NotificationDrawerProvider({ children }: NotificationDrawerProviderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [onNavigateToModule, setOnNavigateToModule] = useState<((moduleId: number) => void) | undefined>(undefined);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const setOnNavigateToModuleCallback = (callback: (moduleId: number) => void) => {
    setOnNavigateToModule(() => callback);
  };

  return (
    <NotificationDrawerContext.Provider 
      value={{ 
        isDrawerOpen, 
        openDrawer, 
        closeDrawer, 
        onNavigateToModule, 
        setOnNavigateToModule: setOnNavigateToModuleCallback 
      }}
    >
      {children}
    </NotificationDrawerContext.Provider>
  );
}

export function useNotificationDrawer() {
  const context = useContext(NotificationDrawerContext);
  if (context === undefined) {
    throw new Error('useNotificationDrawer must be used within a NotificationDrawerProvider');
  }
  return context;
} 
import React, { createContext, useContext, useState } from 'react';

interface NotificationDrawerContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  onNavigateToModule: ((moduleId: string) => void) | null;
  setOnNavigateToModule: (callback: (moduleId: string) => void) => void;
}

const NotificationDrawerContext = createContext<NotificationDrawerContextType | undefined>(undefined);

export function NotificationDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onNavigateToModule, setOnNavigateToModule] = useState<((moduleId: string) => void) | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <NotificationDrawerContext.Provider value={{
      isModalOpen,
      openModal,
      closeModal,
      onNavigateToModule,
      setOnNavigateToModule
    }}>
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
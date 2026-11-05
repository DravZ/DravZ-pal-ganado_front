import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import GlobalNotificationModal from '../components/shared/GlobalNotificationModal/GlobalNotificationModal';

export type NotificationType = 'success' | 'alert' | 'error';

export interface NotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  buttonText?: string;
  onConfirm?: () => void;
}

export interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
  hideNotification: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationOptions | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showNotification = useCallback((options: NotificationOptions) => {
    setNotification(options);
    setIsOpen(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsOpen(false);
    if (notification?.onConfirm) {
      notification.onConfirm();
    }
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {isOpen && notification && (
        <GlobalNotificationModal
          type={notification.type}
          title={notification.title}
          message={notification.message}
          buttonText={notification.buttonText}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};
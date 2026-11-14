import { createContext } from 'react';

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

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

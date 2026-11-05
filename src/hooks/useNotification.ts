import { useContext } from 'react';
import {
  NotificationContext,
} from '../context/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification debe ser utilizado dentro de un NotificationProvider');
  }

  const { showNotification, hideNotification } = context;

  // Funciones helper de conveniencia opcionales
  const notifySuccess = (title: string, message: string, buttonText?: string) => {
    showNotification({ type: 'success', title, message, buttonText });
  };

  const notifyAlert = (title: string, message: string, buttonText?: string) => {
    showNotification({ type: 'alert', title, message, buttonText });
  };

  const notifyError = (title: string, message: string, buttonText?: string) => {
    showNotification({ type: 'error', title, message, buttonText });
  };

  return {
    showNotification,
    hideNotification,
    notifySuccess,
    notifyAlert,
    notifyError
  };
};

export default useNotification;
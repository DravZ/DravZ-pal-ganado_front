import React, { useEffect } from 'react';
import { Check, AlertTriangle, XCircle, X } from 'lucide-react';
import styles from './GlobalNotificationModal.module.css';
import type { NotificationType } from '../../../context/NotificationContext';

interface GlobalNotificationModalProps {
  type: NotificationType;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const GlobalNotificationModal: React.FC<GlobalNotificationModalProps> = ({
  type,
  title,
  message,
  buttonText,
  onClose
}) => {
  // Soporte para cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Renderizado dinámico de íconos y textos según el tipo
  const renderHeaderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className={`${styles.iconCircle} ${styles.iconSuccess}`}>
            <Check size={28} />
          </div>
        );
      case 'alert':
        return (
          <div className={`${styles.iconCircle} ${styles.iconAlert}`}>
            <AlertTriangle size={28} />
          </div>
        );
      case 'error':
        return (
          <div className={`${styles.iconCircle} ${styles.iconError}`}>
            <XCircle size={28} />
          </div>
        );
    }
  };

  const getTagLabel = () => {
    switch (type) {
      case 'success':
        return 'OPERACIÓN EXITOSA';
      case 'alert':
        return 'ADVERTENCIA';
      case 'error':
        return 'ERROR EN EL SISTEMA';
    }
  };

  const getDefaultButtonText = () => {
    switch (type) {
      case 'success':
        return 'Entendido';
      case 'alert':
        return 'Revisar';
      case 'error':
        return 'Cerrar';
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <X size={20} />
        </button>

        {renderHeaderIcon()}

        <span className={styles.tagLabel}>{getTagLabel()}</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.actionsFlex}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles[`btn_${type}`]}`}
            onClick={onClose}
          >
            {buttonText || getDefaultButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalNotificationModal;
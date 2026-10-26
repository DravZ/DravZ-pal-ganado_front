import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => (
  <div className={styles.errorCard}>
    <div className="d-flex align-items-center gap-3 mb-2">
      <AlertTriangle className={styles.errorIcon} size={28} />
      <h3 className={styles.errorTitle}>Información no disponible</h3>
    </div>
    <p className={styles.errorSubtitle}>
      No pudimos recuperar la configuración de la organización.
    </p>
    <button type="button" className={styles.retryBtn} onClick={onRetry}>
      <RotateCw size={16} />
      <span>Intentar de nuevo</span>
    </button>
  </div>
);

export default ErrorState;
// FarmsErrorState.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './FarmsErrorState.module.css';

interface FarmsErrorStateProps {
  onRetry: () => void;
}

export const FarmsErrorState: React.FC<FarmsErrorStateProps> = ({ onRetry }) => (
  <div className={styles.card}>
    <div className={styles.contentFlex}>
      <AlertTriangle className={styles.icon} size={28} />
      <div>
        <h3 className={styles.title}>No pudimos cargar fincas</h3>
        <p className={styles.subtitle}>Verifica la conexión e inténtalo nuevamente.</p>
      </div>
    </div>
    <button type="button" className={styles.retryBtn} onClick={onRetry}>
      Intentar de nuevo
    </button>
  </div>
);
export default FarmsErrorState;
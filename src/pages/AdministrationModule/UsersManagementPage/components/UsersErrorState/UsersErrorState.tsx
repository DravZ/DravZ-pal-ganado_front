// UsersErrorState.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './UsersErrorState.module.css';

interface UsersErrorStateProps {
  onRetry: () => void;
}

export const UsersErrorState: React.FC<UsersErrorStateProps> = ({ onRetry }) => (
  <div className={styles.card}>
    <div className="d-flex align-items-center gap-3">
      <AlertTriangle className={styles.icon} size={24} />
      <div>
        <h3 className={styles.title}>No pudimos cargar usuarios</h3>
        <p className={styles.subtitle}>Verifica la conexión e inténtalo nuevamente.</p>
      </div>
    </div>
    <button type="button" className={styles.retryBtn} onClick={onRetry}>
      Intentar de nuevo
    </button>
  </div>
);
export default UsersErrorState;
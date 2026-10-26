import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './LoadingState.module.css';

export const LoadingState: React.FC = () => (
  <div className={styles.loadingCard}>
    <Loader2 className={styles.spinnerIcon} size={36} />
    <h3 className={styles.loadingTitle}>Cargando organización...</h3>
    <p className={styles.loadingSubtitle}>Consultando la información disponible.</p>
  </div>
);

export default LoadingState;
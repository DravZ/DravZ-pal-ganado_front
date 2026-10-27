// FarmsLoadingState.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './FarmsLoadingState.module.css';

export const FarmsLoadingState: React.FC = () => (
  <div className={styles.card}>
    <Loader2 className={styles.spinner} size={36} />
    <h3 className={styles.title}>Cargando fincas...</h3>
    <p className={styles.subtitle}>Consultando la información disponible.</p>
  </div>
);
export default FarmsLoadingState;
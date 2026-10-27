// UsersLoadingState.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './UsersLoadingState.module.css';

export const UsersLoadingState: React.FC = () => (
  <div className={styles.card}>
    <Loader2 className={styles.spinner} size={36} />
    <h3 className={styles.title}>Cargando usuarios...</h3>
    <p className={styles.subtitle}>Consultando la información disponible.</p>
  </div>
);
export default UsersLoadingState;